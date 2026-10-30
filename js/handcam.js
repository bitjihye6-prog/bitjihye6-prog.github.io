/* Hand control for the "Get the apps" trees.
   The camera picture never leaves the phone or computer: hand tracking runs here, in the browser,
   with MediaPipe files served from this site (/js/mediapipe). Nothing is recorded or sent anywhere.
   onHand(state) gets {x, y, fist, open} for one hand, or null when no hand is in view. */
const LINKS=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

export function readHand(lm){
  if(!lm)return null;
  const palm=d(lm[0],lm[9])||1e-6;
  const curl=[8,12,16,20].reduce((s,i)=>s+d(lm[i],lm[0]),0)/4/palm;   // ~1 for a fist, ~1.9 for an open hand
  return{x:lm[9].x,y:lm[9].y,fist:curl<1.3,open:curl>1.55};
}

export function drawHand(ctx,lm,W,H,color){
  ctx.clearRect(0,0,W,H);if(!lm)return;
  ctx.lineWidth=Math.max(2,W/120);ctx.strokeStyle="rgba(255,241,220,.9)";ctx.lineCap="round";
  for(const[i,j]of LINKS){ctx.beginPath();ctx.moveTo(lm[i].x*W,lm[i].y*H);ctx.lineTo(lm[j].x*W,lm[j].y*H);ctx.stroke()}
  ctx.fillStyle=color;for(const p of lm){ctx.beginPath();ctx.arc(p.x*W,p.y*H,Math.max(3,W/80),0,7);ctx.fill()}
}

export async function startHandCam({video,canvas,color,onHand,onStatus}){
  onStatus("Asking for the camera…");
  let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:false})}
  catch(e){onStatus("Camera blocked. Allow it in your browser, or use the buttons.");return null}
  onStatus("Loading hand tracking…");
  let lmk;
  try{
    const V=await import("./mediapipe/vision_bundle.mjs");
    const files=await V.FilesetResolver.forVisionTasks("/js/mediapipe/wasm");
    const opts=d=>({baseOptions:{modelAssetPath:"/js/mediapipe/hand_landmarker.task",delegate:d},runningMode:"VIDEO",numHands:1});
    try{lmk=await V.HandLandmarker.createFromOptions(files,opts("GPU"))}catch(e){lmk=await V.HandLandmarker.createFromOptions(files,opts("CPU"))}
  }catch(e){stream.getTracks().forEach(t=>t.stop());onStatus("Hand tracking couldn't load on this device.");return null}
  video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();
  canvas.width=video.videoWidth||640;canvas.height=video.videoHeight||480;
  const ctx=canvas.getContext("2d");let run=true,last=-1;
  onStatus("Show your hand");
  const loop=()=>{if(!run)return;
    if(video.currentTime!==last){last=video.currentTime;
      const r=lmk.detectForVideo(video,performance.now()),lm=r.landmarks&&r.landmarks[0];
      drawHand(ctx,lm,canvas.width,canvas.height,color());onHand(readHand(lm),lm)}
    requestAnimationFrame(loop)};
  requestAnimationFrame(loop);
  return{stop(){run=false;stream.getTracks().forEach(t=>t.stop());lmk.close&&lmk.close();ctx.clearRect(0,0,canvas.width,canvas.height)}};
}
