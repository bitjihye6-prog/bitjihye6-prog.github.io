/* Get the apps: each app grows its own leafy 3D tree on black (no box).
   Snip lime green, Lastly changes season, Folderoo teal and gold. From overhead, in a pool of sunlight, the leaves are the app's QR code.
   three.js is self-hosted and only loads when this section comes into view. */
const Q={"snip":{"n":33,"r":["1fc4e7b7f","104131641","174e6a25d","174d1175d","1751bbd5d","104b09441","1fd55557f","1f50500","674d5ad0","1e340d2cf","df2ca203","79c64172","fda7b5b2","141b39d00","2589481c","1a8495e0d","1946f1bfd","227b0677","5cad70d6","140685082","1f7ca180d","1b88db6c5","c2b2f6f","fab57299","1056c71f0","11f5314","1fdf2a754","104d9ab1f","1744a83f6","175ac662b","1756297cc","1048a8101","1fcd70a3c"]},"lastly":{"n":37,"r":["1fc8ae707f","104cf07141","174a6e085d","1742236a5d","175164be5d","104e694441","1fd555557f","1663af00","67d7f2ed0","1d1b176a70","47130a980","161a22dd1e","772a16fdf","79e553f57","d494e9496","d238473f3","78a3680e","3374066c1","ad240ef97","8aaa2f27a","16d84d4592","519e23022","16c5a93490","1203560f8f","155dbb804d","b2eb4211d","9d9995f06","15925e1191","453eafbfc","10aabd1d","1fdd61895b","10455d631b","174323c5f8","175856cd5c","175d93427a","104b06fa0c","1fc655fc17"]},"folderoo":{"n":37,"r":["1fcb7a1d7f","1055b0d541","175b0ffe5d","175a19685d","175de3655d","105aa8fd41","1fd555557f","65bab00","4f4a238be","712fbe869","35002b2cd","d3ee0443a","5451b8269","29e3a7bc5","184a0c024d","1b3ba4e1ba","1fc63bb363","1a0d552fe5","1f5a1cc221","c3d6596e9","1aed3e2349","7a0841269","1bc99d7f3d","133534f6e8","2e9a22de8","8bc05452b","1cc24829e5","59b3a83c8","1a7acd71f1","102eb519","1fdab6e55d","105d127719","17406453f3","174a72d715","17532f5117","104cd1b328","1fcc1391a1"]}};
const NAMES={snip:"Snip",lastly:"Lastly",folderoo:"Folderoo"};
const LOGOS={snip:'<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="qcl"><polygon points="0,0 56,0 38,100 0,100"/></clipPath><clipPath id="qcr"><polygon points="64,0 100,0 100,100 46,100"/></clipPath></defs><rect width="100" height="100" rx="24" fill="#0b0b0b"/><g clip-path="url(#qcl)"><rect x="14" y="26" width="72" height="48" rx="9" fill="#c8ff2e"/><rect x="14" y="36" width="72" height="8" fill="#0b0b0b"/></g><g clip-path="url(#qcr)" transform="translate(3,-2)"><rect x="14" y="26" width="72" height="48" rx="9" fill="#c8ff2e"/><rect x="14" y="36" width="72" height="8" fill="#0b0b0b"/></g></svg>',lastly:'<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#fff1dc" stroke="#0b0b0c" stroke-opacity=".12"/><path d="M28 22V78H78" fill="none" stroke="#9d8cff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 22V67H78" fill="none" stroke="#ff8fc7" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 22V56H78" fill="none" stroke="#ffa03a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>',folderoo:'<svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="27" fill="#0A4441"/><ellipse cx="58" cy="107" rx="24" ry="3.2" fill="#07302E"/><g transform="translate(2 -8) rotate(-14 60 70)"><path d="M42 90 Q24 98 12 86 Q26 91 44 82 Z" fill="#E8A21F"/><ellipse cx="54" cy="99" rx="17" ry="5" fill="#E8A21F" transform="rotate(18 54 99)"/><ellipse cx="58" cy="72" rx="23" ry="26" fill="#E8A21F"/><ellipse cx="69" cy="48" rx="8" ry="13" fill="#E8A21F" transform="rotate(28 69 48)"/><ellipse cx="66" cy="23" rx="4.2" ry="9.5" fill="#E8A21F" transform="rotate(-34 66 23)"/><ellipse cx="66" cy="24" rx="1.9" ry="5.8" fill="#F3A6A0" transform="rotate(-34 66 24)"/><ellipse cx="73" cy="21" rx="4.2" ry="9.5" fill="#E8A21F" transform="rotate(-20 73 21)"/><ellipse cx="73" cy="22" rx="1.9" ry="5.8" fill="#F3A6A0" transform="rotate(-20 73 22)"/><ellipse cx="75" cy="36" rx="12" ry="10" fill="#E8A21F"/><ellipse cx="85" cy="40" rx="8" ry="6" fill="#E8A21F"/><circle cx="78" cy="33" r="2.3" fill="#17323A"/><circle cx="92" cy="39" r="2" fill="#17323A"/><ellipse cx="81" cy="60" rx="3.5" ry="8" fill="#E8A21F" transform="rotate(-70 81 60)"/><path d="M39 62 h12 a2 2 0 0 1 1.6 0.8 l2.8 3.6 h20.6 a3 3 0 0 1 3 3 v21 a5 5 0 0 1 -5 5 H44 a5 5 0 0 1 -5 -5 Z" fill="#0A4441"/><rect x="47" y="55" width="23" height="27" rx="2.8" fill="#FFFFFF" transform="rotate(-6 58 68)"/><rect x="51" y="60" width="13" height="2.6" rx="1.3" fill="#B9CBC8" transform="rotate(-6 58 68)"/><rect x="51" y="65.5" width="9" height="2.6" rx="1.3" fill="#B9CBC8" transform="rotate(-6 58 68)"/><path d="M39 76 Q59.5 86 79 76 V91 a5 5 0 0 1 -5 5 H44 a5 5 0 0 1 -5 -5 Z" fill="#5FC4B8"/></g></svg>'};
const PAL={
  snip:{bright:["#c8ff2e","#a8e61f","#d9ff6b","#8fd14f","#b6f03a","#e4ff8c"],code:["#2f6a08","#3a7400","#467f06"]},
  lastly:{bright:["#ff8fc7","#ffb0d6","#f472b6","#ffc4e0"],code:["#4a3bb0","#a82a68","#b4530c"],
    seasons:[["#ff8fc7","#ffb0d6","#f472b6","#ffc4e0"],["#9d8cff","#b9acff","#c9b8ff","#8a76f5"],["#ffa03a","#ffc46b","#f08a1c","#ffb057"]]},
  folderoo:{bright:["#2fa597","#14857f","#4cc0ae","#3bb3a3","#E8A21F","#f6c453"],code:["#0d4f4b","#0b4541","#7a4d00"]}
};
// Dark style: light leaves on the dark page, with only a faint glow in the app's colour (no bright background).
const LIGHT={snip:["#e4ff8c","#d4ff5c","#c8ff2e"],lastly:["#ffc4e0","#d6ccff","#ffcf94"],folderoo:["#86e3d6","#f6c453","#b3f0e6"]};
const GLOW={snip:"200,255,46",lastly:"255,143,199",folderoo:"76,192,174"};
let STYLE="dark";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const card=$("#qrLink"),flat=$("#qrCanvas"),holder=$("#qrTree"),logo=$("#qrLogo"),cap=$("#qrCap"),replay=$("#qrToggle"),tabs=$$(".get-tab");
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd=s=>{let x=s|0||1;return()=>((x^=x<<13,x^=x>>>17,x^=x<<5)>>>0)/4294967296};
const cl=t=>t<0?0:t>1?1:t,eio=t=>{t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},eo=t=>1-Math.pow(1-cl(t),3);
function mods(a){const q=Q[a],N=q.n,o=[],c0=(N-7)/2;q.r.forEach((h,y)=>{const b=BigInt("0x"+h).toString(2).padStart(N,"0");for(let x=0;x<N;x++)if(b[x]==="1"&&!(x>=c0&&x<c0+7&&y>=c0&&y<c0+7))o.push({x,y,f:(x<7&&y<7)||(x>=N-7&&y<7)||(x<7&&y>=N-7)})});return{N,M:N+8,o}}
const crownR=N=>N*.43, inCrown=(m,N)=>Math.hypot(m.x+.5-N/2,m.y+.5-N/2)<crownR(N);
function codeCol(a,m,N){const c=PAL[a].code;
  if(a==="folderoo")return (m.x*7+m.y*3)%5?c[(m.x+m.y)%2]:c[2];
  return a==="lastly"?c[((m.x+m.y)>>2)%3]:c[(m.x*5+m.y*3)%3]}
function finderCol(a){return PAL[a].code[0]}

let app="snip",three=null,S=null,M=41,HAND=null,CAM=null;

/* ---------- the scannable code (round dots, crisp corner markers, soft light glow, no box) ---------- */
function drawFlat(){
  const dpr=Math.min(devicePixelRatio||1,2),W=card.clientWidth||400,Z=Math.round(W*dpr);flat.width=flat.height=Z;const x=flat.getContext("2d");
  const {N,M:MM,o}=mods(app);M=MM;const size=Z*.7,ox=(Z-size)/2,cell=size/M,R=rnd(77);
  // a warm pool of sunlight (light enough behind the code for every phone to scan)
  card.classList.toggle("dark",STYLE==="dark");
  if(STYLE==="dark")return drawDark(x,Z,size,ox,cell,N,o,R);
  const g=x.createRadialGradient(Z/2,Z*.48,0,Z/2,Z/2,Z*.54);g.addColorStop(0,"rgba(255,249,234,1)");g.addColorStop(.6,"rgba(255,243,220,1)");g.addColorStop(.8,"rgba(255,226,170,.92)");g.addColorStop(.9,"rgba(255,196,110,.45)");g.addColorStop(1,"rgba(255,170,80,0)");x.fillStyle=g;x.fillRect(0,0,Z,Z);
  for(const m of o){if(m.f)continue;const cx=ox+(m.x+4.5)*cell,cy=ox+(m.y+4.5)*cell;x.fillStyle=codeCol(app,m,N);x.beginPath();
    if(app==="lastly")x.ellipse(cx,cy,cell*.5,cell*.44,(R()-.5)*.9,0,Math.PI*2);else x.arc(cx,cy,cell*.46,0,Math.PI*2);x.fill()}
  const fc=finderCol(app);
  for(const[fx,fy]of[[0,0],[N-7,0],[0,N-7]]){const X=ox+(fx+4)*cell,Y=ox+(fy+4)*cell;
    x.fillStyle=fc;x.beginPath();x.roundRect(X,Y,7*cell,7*cell,cell*.5);x.fill();
    x.fillStyle="#fff4de";x.beginPath();x.roundRect(X+cell,Y+cell,5*cell,5*cell,cell*.35);x.fill();
    x.fillStyle=app==="lastly"?PAL.lastly.code[1]:fc;x.beginPath();x.roundRect(X+2*cell,Y+2*cell,3*cell,3*cell,cell*.25);x.fill()}
}
// light dots on the dark page (an "inverted" code). The quiet zone stays dark so phones can find the code.
function drawDark(x,Z,size,ox,cell,N,o,R){
  x.clearRect(0,0,Z,Z);const L=LIGHT[app];
  const g=x.createRadialGradient(Z/2,Z/2,0,Z/2,Z/2,Z*.5);g.addColorStop(0,"rgba("+GLOW[app]+",.13)");g.addColorStop(.75,"rgba("+GLOW[app]+",.06)");g.addColorStop(1,"rgba("+GLOW[app]+",0)");x.fillStyle=g;x.fillRect(0,0,Z,Z);
  for(const m of o){if(m.f)continue;const cx=ox+(m.x+4.5)*cell,cy=ox+(m.y+4.5)*cell;x.fillStyle=L[(m.x*5+m.y*3)%L.length];x.beginPath();
    if(app==="lastly")x.ellipse(cx,cy,cell*.5,cell*.44,(R()-.5)*.9,0,Math.PI*2);else x.arc(cx,cy,cell*.46,0,Math.PI*2);x.fill()}
  for(const[fx,fy]of[[0,0],[N-7,0],[0,N-7]]){const X=ox+(fx+4)*cell,Y=ox+(fy+4)*cell;
    x.fillStyle=L[0];x.beginPath();x.roundRect(X,Y,7*cell,7*cell,cell*.5);x.fill();
    x.fillStyle="#0b0b0c";x.beginPath();x.roundRect(X+cell,Y+cell,5*cell,5*cell,cell*.35);x.fill();
    x.fillStyle=L[0];x.beginPath();x.roundRect(X+2*cell,Y+2*cell,3*cell,3*cell,cell*.25);x.fill()}
}
function setApp(a){
  app=a;card.href="/get/"+a+"/";
  flat.setAttribute("aria-label","QR code that opens "+NAMES[a]+" on Google Play");
  cap.innerHTML="Scan for <b>"+NAMES[a]+"</b>";
  logo.innerHTML=LOGOS[a];
  tabs.forEach(t=>t.setAttribute("aria-selected",t.dataset.app===a?"true":"false"));
  drawFlat();
}

/* ---------- 3D ---------- */
async function boot(){
  if(S)return true;if(RM)return false;
  let T;try{const c=document.createElement("canvas");if(!(c.getContext("webgl2")||c.getContext("webgl")))return false;T=await import("./three.module.min.js")}catch(e){return false}
  const r=new T.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
  r.toneMapping=T.ACESFilmicToneMapping;r.setClearColor(0x000000,0);holder.appendChild(r.domElement);
  const scene=new T.Scene();
  {const env=new T.Scene(),g=new T.SphereGeometry(50,32,16),c=[],p=g.attributes.position;for(let i=0;i<p.count;i++){const k=.12+.5*Math.max(0,p.getY(i)/50);c.push(k,k*.97,k*.93)}
   g.setAttribute("color",new T.Float32BufferAttribute(c,3));env.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
   for(const[x,y,z,s]of[[-20,30,10,14],[25,18,-15,10],[0,40,-25,18]]){const m=new T.Mesh(new T.PlaneGeometry(s,s),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m)}
   scene.environment=new T.PMREMGenerator(r).fromScene(env,.04).texture}
  scene.add(new T.HemisphereLight(0xffffff,0x202030,.6));
  const key=new T.DirectionalLight(0xffffff,2.4);key.position.set(-20,45,25);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-34,right:34,top:34,bottom:-34,far:160});scene.add(key);
  // invisible floor that only shows soft shadows, so nothing looks like a box
  const floor=new T.Mesh(new T.PlaneGeometry(240,240),new T.ShadowMaterial({opacity:.35}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const cam=new T.PerspectiveCamera(34,1,.1,600);
  const petal=(()=>{const s=new T.Shape();s.moveTo(0,-.55);s.bezierCurveTo(.55,-.35,.5,.35,0,.6);s.bezierCurveTo(-.5,.35,-.55,-.35,0,-.55);const g=new T.ShapeGeometry(s,10),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.18*x*x+.08*y*y)}g.computeVertexNormals();g.rotateX(-Math.PI/2);return g})();
  S={T,r,scene,cam,petal,G:null,items:[],raf:0,t0:0};
  const resize=()=>{const W=card.clientWidth;r.setSize(W,W,false);r.domElement.style.width=r.domElement.style.height="100%"};resize();addEventListener("resize",resize);
  return true;
}
function clear(){const {scene}=S;if(S.G){scene.remove(S.G);S.G.traverse(o=>{if(o.geometry&&o.geometry!==S.petal)o.geometry.dispose();if(o.material)o.material.dispose()})}S.G=new S.T.Group();scene.add(S.G);S.U={}}
function build(){
  const {T}=S;clear();const {N,M:MM,o}=mods(app);M=MM;const P=PAL[app],R=rnd(app.length*31+7);
  S.items=o.map(m=>({m,X:m.x+4-M/2+.5,Z:m.y+4-M/2+.5,c:new T.Color(P.bright[(R()*P.bright.length)|0]),cc:new T.Color(codeCol(app,m,N)),r1:R(),r2:R(),r3:R(),r4:R()}));
  S.items.forEach(it=>it.dist=Math.hypot(it.X,it.Z));
  const n=S.items.length,G=S.G,U=S.U;
  {
    // the tree: trunk, branches, thousands of leaves; grass where the code's corners are; no platform
    const H0=N*.6,VR=N*.5,CR=crownR(N),dummy=new T.Object3D(),col=new T.Color();
    const bark=new T.MeshStandardMaterial({color:0x6b4429,roughness:.9});
    const trunk=new T.Mesh(new T.CylinderGeometry(.75,1.3,H0,9),bark);trunk.position.y=H0/2;trunk.castShadow=true;G.add(trunk);U.trunk=trunk;
    const twigs=new T.Group();G.add(twigs);U.twigs=twigs;
    for(let k=0;k<9;k++){const len=CR*(.45+R()*.35),ang=k/9*Math.PI*2+R()*.4,y=H0*(.45+R()*.45),b=new T.Mesh(new T.CylinderGeometry(.12,.3,len,5),bark);b.castShadow=true;
      b.position.set(Math.cos(ang)*len*.42,y+len*.32,Math.sin(ang)*len*.42);b.lookAt(Math.cos(ang)*len,y+len*.9,Math.sin(ang)*len);b.rotateX(Math.PI/2);twigs.add(b)}
    const leafGeo=new T.CircleGeometry(.55,5);leafGeo.scale(1,.72,1);
    const crownPts=S.items.filter(it=>inCrown(it.m,N)),grassPts=S.items.filter(it=>!inCrown(it.m,N)),per=7,extra=1500;
    const leaves=new T.InstancedMesh(leafGeo,new T.MeshStandardMaterial({side:T.DoubleSide,roughness:.7}),crownPts.length*per+extra);leaves.castShadow=true;
    let i=0;U.tint=[];const put=(x,z,y)=>{dummy.position.set(x,y,z);dummy.rotation.set(R()*6,R()*6,R()*6);dummy.scale.setScalar(.8+R()*.6);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);const pk=R(),sh=.8+R()*.3;U.tint.push([pk,sh]);col.set(P.bright[(pk*P.bright.length)|0]).multiplyScalar(sh);leaves.setColorAt(i++,col)};
    for(const it of crownPts){const rr=it.dist/CR,h=Math.sqrt(Math.max(0,1-rr*rr));for(let k=0;k<per;k++)put(it.X+(R()-.5)*.7,it.Z+(R()-.5)*.7,k?H0+VR*h*(R()*1.9-1):H0+VR*h*.95)}
    for(let k=0;k<extra;k++){const a=R()*Math.PI*2,rr=Math.sqrt(R())*CR*.92,hh=Math.sqrt(Math.max(0,1-(rr/CR)**2))*(.85+.25*Math.sin(a*3+1));put(Math.cos(a)*rr,Math.sin(a)*rr,H0+VR*hh*(R()*1.6-1)*.95)}
    G.add(leaves);U.leaves=leaves;U.H0=H0;
    const blades=new T.InstancedMesh(leafGeo,new T.MeshStandardMaterial({side:T.DoubleSide,roughness:.75}),grassPts.length*4);blades.castShadow=true;i=0;
    U.fall=[];for(const it of grassPts)for(let k=0;k<4;k++){U.fall.push(R());dummy.position.set(it.X+(R()-.5)*.5,.05+k*.07,it.Z+(R()-.5)*.5);dummy.rotation.set(-Math.PI/2+(R()-.5)*.5,(R()-.5)*.4,R()*6);dummy.scale.setScalar(.75+R()*.4);dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);col.set(P.bright[(R()*P.bright.length)|0]).multiplyScalar(.85+R()*.2);blades.setColorAt(i++,col)}
    G.add(blades);U.blades=blades;
    const drift=new T.InstancedMesh(leafGeo,new T.MeshStandardMaterial({side:T.DoubleSide}),40);U.drift=drift;U.dd=[];for(let k=0;k<40;k++){U.dd.push({a:R()*6.3,r:R()*CR,y:R()*H0*1.5,v:2+R()*2.5,s:R()*6});drift.setColorAt(k,col.set(P.bright[k%P.bright.length]))}G.add(drift);
    S.view={lift:H0*.75,dist:96};
    const sc=document.createElement("canvas");sc.width=sc.height=256;const sx=sc.getContext("2d"),sg=sx.createRadialGradient(128,128,0,128,128,128);if(STYLE==="dark"){sg.addColorStop(0,"rgba("+GLOW[app]+",.35)");sg.addColorStop(.7,"rgba("+GLOW[app]+",.12)");sg.addColorStop(1,"rgba("+GLOW[app]+",0)")}else{sg.addColorStop(0,"rgba(255,246,226,1)");sg.addColorStop(.6,"rgba(255,232,190,.85)");sg.addColorStop(1,"rgba(255,190,110,0)")}sx.fillStyle=sg;sx.fillRect(0,0,256,256);
    U.sun=new T.Mesh(new T.PlaneGeometry(M*1.15,M*1.15),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));U.sun.rotation.x=-Math.PI/2;U.sun.position.y=.02;G.add(U.sun)}
  G.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false});
  if(U.mesh){S.items.forEach((it,k)=>U.mesh.setColorAt(k,it.c));U.mesh.instanceColor.needsUpdate=true}
}
const SHOW={snip:6.2,lastly:6.2,folderoo:6.2},HOLD=8;let FLY=1.9;
function restart(){FLY=1.9;card.classList.remove("code");S.t0=performance.now();if(S.U)S.U.si=undefined}
// "Show QR": skip ahead to the fully grown tree and fly overhead in under a second
async function quick(){if(RM||!(await boot())){card.classList.add("code");return}if(S.built!==app){build();S.built=app}FLY=.8;S.t0=performance.now()-SHOW[app]*1000;if(!S.raf)S.raf=requestAnimationFrame(frame)}
function frame(now){
  if(!S)return;const {T,cam,U}=S,t=typeof window.__qrT==="number"?window.__qrT:Math.max(0,(now-S.t0)/1000),show=SHOW[app],TOP=show+FLY;
  if(HAND){HAND.az+=(HAND.azT-HAND.az)*.08;HAND.top+=(HAND.topT-HAND.top)*.06}
  const top=HAND?eio(HAND.top):eio((t-show)/(FLY-.15)),free=t*.22+.5,goal=HAND?Math.round(HAND.az/6.2832)*6.2832:Math.ceil((show*.22+.5)/6.2832+.4)*6.2832,
    az=HAND?HAND.az+(goal-HAND.az)*top:(t<show?free:free+(goal-free)*top);
  const fitD=M/.7/(2*Math.tan(T.MathUtils.degToRad(17)));
  const el=T.MathUtils.lerp(.32,Math.PI/2-.0008,top),dist=T.MathUtils.lerp(S.view.dist,fitD,top),ly=T.MathUtils.lerp(S.view.lift,0,top);
  cam.position.set(Math.sin(az)*Math.cos(el)*dist,Math.sin(el)*dist+ly,Math.cos(az)*Math.cos(el)*dist);cam.lookAt(0,ly,0);
  const d=new T.Object3D(),col=new T.Color(),fade=eio((t-show+.2)/1.3);
  if(U.mesh){U.mesh.instanceMatrix.needsUpdate=true;U.mesh.instanceColor.needsUpdate=true}
  {const g=eio(t/1.4),gl=Math.max(.01,eio((t-.5)/1.1));U.trunk.scale.set(1,Math.max(.01,g),1);U.trunk.position.y=U.H0*g/2;U.twigs.scale.setScalar(Math.max(.01,eio((t-.3)/1)));
    U.leaves.scale.setScalar(gl);U.leaves.position.y=U.H0*(1-gl);U.blades.scale.setScalar(Math.max(.01,eio((t-.9)/1.2)));
    U.dd.forEach((q,k)=>{q.y-=q.v*.016;if(q.y<.3)q.y=U.H0*1.4;const a=q.a+t*.3;d.position.set(Math.cos(a)*q.r+Math.sin(t*2+q.s)*.6,q.y,Math.sin(a)*q.r);d.rotation.set(t*2+q.s,t*1.3,q.s);d.scale.setScalar(t>1.5&&t<show?.9:0);d.updateMatrix();U.drift.setMatrixAt(k,d.matrix)});U.drift.instanceMatrix.needsUpdate=true;
    U.sun.material.opacity=(HAND?top:eio((t-show)/FLY))*.9;
    // Lastly: the tree walks through the seasons while it turns
    if(app==="lastly"){const ss=PAL.lastly.seasons,si=Math.min(ss.length-1,Math.floor(t/2));if(si!==U.si){U.si=si;const pal=ss[si];U.tint.forEach(([pk,sh],k)=>U.leaves.setColorAt(k,col.set(pal[(pk*pal.length)|0]).multiplyScalar(sh)));U.leaves.instanceColor.needsUpdate=true;
      U.fall.forEach((pk,k)=>U.blades.setColorAt(k,col.set(pal[(pk*pal.length)|0])));U.blades.instanceColor.needsUpdate=true;for(let k=0;k<40;k++)U.drift.setColorAt(k,col.set(pal[k%pal.length]));U.drift.instanceColor.needsUpdate=true}}}
  card.classList.toggle("code",HAND?HAND.top>.97:t>=TOP-.35);
  // hold the code long enough to scan, then grow the tree again so it never sits as a plain code
  if(!HAND&&t>=TOP+HOLD&&typeof window.__qrT!=="number"){restart();S.raf=requestAnimationFrame(frame);return}
  if(HAND||t<TOP+.9||typeof window.__qrT==="number")S.r.render(S.scene,cam);
  S.raf=requestAnimationFrame(frame);
}
async function play(){
  FLY=1.9;card.classList.remove("code");
  if(!(await boot())){card.classList.add("code");return}
  cancelAnimationFrame(S.raf);if(S.built!==app){build();S.built=app}else if(S.U)S.U.si=undefined;S.t0=performance.now();S.raf=requestAnimationFrame(frame);
}

/* ---------- wiring ---------- */
setApp("lastly");
/* ---------- hand control: move to turn the tree, raise your hand to lift the camera, make a fist for the QR code ---------- */
const handBtn=$("#qrHand"),camBox=$("#handCam"),hStat=$("#handStatus");
function onHand(h){
  if(!HAND)return;
  if(!h){HAND.fistAt=0;hStat.textContent="Show your hand";return}
  HAND.azT=.5+(.5-h.x)*5;
  const now=performance.now();
  if(h.fist){if(!HAND.fistAt)HAND.fistAt=now;if(now-HAND.fistAt>400)HAND.topT=1}
  else{HAND.fistAt=0;if(h.open)HAND.topT=Math.max(0,Math.min(.55,(.75-h.y)/.5*.55))}
  hStat.textContent=HAND.topT>=1?"QR code. Open your hand to grow the tree back":h.fist?"Hold the fist…":"Move to turn · raise to lift · fist for the QR";
}
function stopHand(){if(CAM)CAM.stop();CAM=null;HAND=null;camBox.hidden=true;hStat.hidden=true;handBtn.textContent="Use my hand ✋";handBtn.setAttribute("aria-pressed","false")}
async function toggleHand(){
  if(CAM||HAND){stopHand();play();return}
  hStat.hidden=false;handBtn.disabled=true;
  if(!(await boot())){hStat.textContent="3D isn't available on this device.";handBtn.disabled=false;return}
  if(S.built!==app){build();S.built=app}
  HAND={az:.5,azT:.5,top:0,topT:0,fistAt:0};
  const {startHandCam}=await import("./handcam.js?v=202610292145");
  CAM=await startHandCam({video:$("#handVideo"),canvas:$("#handSkel"),color:()=>LIGHT[app][0],onHand,onStatus:t=>hStat.textContent=t});
  handBtn.disabled=false;
  if(!CAM){HAND=null;return}
  camBox.hidden=false;handBtn.textContent="Stop camera";handBtn.setAttribute("aria-pressed","true");
  card.classList.remove("code");cancelAnimationFrame(S.raf);S.t0=performance.now();S.raf=requestAnimationFrame(frame);
}
if(handBtn){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)handBtn.hidden=true;else handBtn.addEventListener("click",toggleHand)}
if(location.hash==="#qrtest")window.__qr={style(s){STYLE=s;drawFlat();if(S)S.built=null},hand:onHand,
  fake(){HAND={az:.5,azT:.5,top:0,topT:0,fistAt:0};camBox.hidden=false;hStat.hidden=false;handBtn.textContent="Stop camera";boot().then(()=>{if(S.built!==app){build();S.built=app}card.classList.remove("code");cancelAnimationFrame(S.raf);S.t0=performance.now();S.raf=requestAnimationFrame(frame)})}};

if(RM||!("IntersectionObserver" in window)){card.classList.add("code");replay.hidden=true;const qb=$("#qrQuick");if(qb)qb.hidden=true;if(handBtn)handBtn.hidden=true}
else{
  let visible=false;
  const io=new IntersectionObserver(es=>{const v=es.some(e=>e.isIntersecting);if(v===visible)return;visible=v;
    if(v)play();else{if(CAM)stopHand();card.classList.remove("code");if(S){cancelAnimationFrame(S.raf);S.raf=0}}},{rootMargin:"0px 0px -15% 0px",threshold:.15});io.observe(card);
}
tabs.forEach(t=>t.addEventListener("click",()=>{setApp(t.dataset.app);if(!RM)play()}));
replay.addEventListener("click",()=>{if(!RM){FLY=1.9;play()}});
const quickBtn=$("#qrQuick");if(quickBtn)quickBtn.addEventListener("click",quick);
addEventListener("resize",drawFlat);
