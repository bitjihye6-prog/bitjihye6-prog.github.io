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

/* One Euro filter: steady when the hand is still, quick when it moves, so the tree follows without jitter or lag */
function oneEuro(minCut=1.2,beta=8,dCut=1){let x=null,dx=0,tp=0;const a=(c,dt)=>1/(1+1/(2*Math.PI*c*dt));
  return(v,t)=>{if(x===null){x=v;tp=t;return v}const dt=Math.max(1e-3,(t-tp)/1000);tp=t;const d=(v-x)/dt;dx+=a(dCut,dt)*(d-dx);x+=a(minCut+beta*Math.abs(dx),dt)*(v-x);return x}}

/* Apps' built-in browsers (Instagram, Facebook, TikTok, Snapchat…) often block the camera or the tracker */
export const IN_APP=/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Snapchat|TikTok|musical_ly|BytedanceWebview|Line\/|LinkedInApp|Twitter|Pinterest|GSA\//i.test(navigator.userAgent);
const MOBILE=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function openCamera(){
  const tries=[{facingMode:"user",width:{ideal:640},height:{ideal:480},frameRate:{ideal:30}},{facingMode:"user"},true];
  let last;for(const v of tries){try{return await navigator.mediaDevices.getUserMedia({video:v,audio:false})}catch(e){last=e;if(e&&(e.name==="NotAllowedError"||e.name==="SecurityError"))break}}
  throw last;
}

/* engines, most reliable first. force (testing only): "worker-CPU" | "worker-GPU" | "main-CPU" */
function engines(force){
  if(force)return[force];
  const w=(window.Worker&&window.createImageBitmap)?(MOBILE?["worker-CPU"]:["worker-GPU","worker-CPU"]):[];
  return[...w,"main-CPU"];
}

export async function startHandCam({video,canvas,color,onHand,onStatus,force}){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){onStatus(IN_APP?"This app's browser can't use the camera. Open drakiverse.studio in Chrome or Safari.":"This browser can't use the camera. Use the buttons instead.");return null}
  onStatus("Asking for the camera…");
  let stream;
  try{stream=await openCamera()}
  catch(e){onStatus(IN_APP?"This app's browser blocked the camera. Tap ⋯ → Open in browser, then try again.":"Camera blocked. Allow it in your browser settings, or use the buttons.");return null}
  video.setAttribute("playsinline","");video.setAttribute("muted","");video.muted=true;video.playsInline=true;video.srcObject=stream;
  try{await video.play()}catch(e){}
  for(let k=0;k<50&&!(video.videoWidth>0);k++)await wait(100); // wait for the first real frame (iPhones are slower)
  // Low Power Mode on iPhones can pause the preview: a tap on the camera box restarts it
  const box=video.parentElement;if(box)box.addEventListener("click",()=>{video.play().catch(()=>{})});
  if(video.paused){onStatus("Tap the small camera box to start");for(let k=0;k<100&&video.paused;k++)await wait(100)}
  canvas.width=video.videoWidth||480;canvas.height=video.videoHeight||360;
  onStatus("Loading hand tracking… (first time takes a few seconds)");
  const ctx=canvas.getContext("2d");let run=true,seen=0,frames=0,startT=performance.now();
  const fx=oneEuro(),fy=oneEuro();
  const emit=lm=>{if(!run)return;frames++;if(lm)seen++;drawHand(ctx,lm,canvas.width,canvas.height,color());const h=readHand(lm);
    if(h){const t=performance.now();h.x=fx(h.x,t);h.y=fy(h.y,t)}onHand(h,lm)};
  let stopEngine=()=>{},mode=null;

  async function startWorker(delegate){
    const worker=new Worker("/js/handworker.js?v=3");
    const got=await new Promise(res=>{const to=setTimeout(()=>res(null),60000);
      worker.onmessage=e=>{if(e.data.type==="ready"){clearTimeout(to);res(e.data.delegate)}else if(e.data.type==="error"){clearTimeout(to);res(null)}};
      worker.onerror=()=>{clearTimeout(to);res(null)};worker.postMessage({type:"init",prefer:delegate})});
    if(!got){worker.terminate();return null}
    let busy=false,alive=true,fails=0;
    worker.onmessage=e=>{if(e.data.type==="result"){busy=false;emit(e.data.lm)}};
    const pump=async()=>{if(!run||!alive)return;
      if(!busy&&video.readyState>=2&&video.videoWidth){busy=true;
        try{const bmp=await createImageBitmap(video);worker.postMessage({type:"frame",frame:bmp,t:performance.now()},[bmp]);fails=0}catch(e){busy=false;fails++}}
      requestAnimationFrame(pump)};
    requestAnimationFrame(pump);
    return{name:"worker-"+got,stop(){alive=false;worker.terminate()},bad:()=>fails>30};
  }
  async function startMain(){
    const V=await import("./mediapipe/vision_bundle.mjs");
    const files=await V.FilesetResolver.forVisionTasks("/js/mediapipe/wasm");
    const lmk=await V.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:"/js/mediapipe/hand_landmarker.task",delegate:"CPU"},runningMode:"VIDEO",numHands:1,minHandDetectionConfidence:.4,minHandPresenceConfidence:.4,minTrackingConfidence:.4});
    let last=-1,n=0,alive=true;
    const loop=()=>{if(!run||!alive)return;
      if(video.readyState>=2&&video.currentTime!==last&&(n++&1)===0){last=video.currentTime;try{const r=lmk.detectForVideo(video,performance.now());emit(r.landmarks&&r.landmarks[0])}catch(e){}}
      requestAnimationFrame(loop)};
    requestAnimationFrame(loop);
    return{name:"main-CPU",stop(){alive=false;try{lmk.close()}catch(e){}},bad:()=>false};
  }
  async function launch(list){
    for(const e of list){try{const eng=e==="main-CPU"?await startMain():await startWorker(e.split("-")[1]);if(eng){mode=eng;stopEngine=()=>eng.stop();return true}}catch(err){console.warn("hand engine "+e+" failed",err)}}
    return false;
  }
  const list=engines(force);
  if(!(await launch(list))){stream.getTracks().forEach(t=>t.stop());onStatus("Hand tracking couldn't start on this device. Use the buttons instead.");return null}
  onStatus("Show your hand: palm to the camera, about an arm's length away");
  frames=0;seen=0;startT=performance.now(); // measure speed from when tracking actually starts

  // Watchdog: if the chosen engine isn't keeping up or never sees anything, quietly move to the next one.
  const tried=new Set([mode.name]);
  const watch=setInterval(async()=>{if(!run){clearInterval(watch);return}
    const el=(performance.now()-startT)/1000,fps=frames/Math.max(1,el);
    const stuck=mode.bad()||(el>5&&fps<2)||(el>7&&seen===0&&mode.name==="worker-GPU");
    if(stuck&&!force){const next=list.concat(["worker-CPU","main-CPU"]).find(n=>!tried.has(n)&&!(n.startsWith("worker")&&!(window.Worker&&window.createImageBitmap)));
      if(next){tried.add(next);stopEngine();frames=0;seen=0;startT=performance.now();if(!(await launch([next])))return;}}
    if(el>8&&seen===0)onStatus("Can't see a hand yet: try more light, and hold your whole hand up facing the camera");
  },1000);

  return{get engine(){return mode&&mode.name},stats:()=>({frames,seen}),
    stop(){run=false;clearInterval(watch);stopEngine();stream.getTracks().forEach(t=>t.stop());ctx.clearRect(0,0,canvas.width,canvas.height)}};
}
