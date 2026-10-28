/* Get the apps: each app grows a leafy 3D tree on a little stone garden.
   Seen from straight above, its leaves and grass are that app's QR code.
   The 3D engine (three.js, self-hosted) only loads when this section comes into view. */
const Q={"snip":{"n":33,"r":["1fc4e7b7f","104131641","174e6a25d","174d1175d","1751bbd5d","104b09441","1fd55557f","1f50500","674d5ad0","1e340d2cf","df2ca203","79c64172","fda7b5b2","141b39d00","2589481c","1a8495e0d","1946f1bfd","227b0677","5cad70d6","140685082","1f7ca180d","1b88db6c5","c2b2f6f","fab57299","1056c71f0","11f5314","1fdf2a754","104d9ab1f","1744a83f6","175ac662b","1756297cc","1048a8101","1fcd70a3c"]},"lastly":{"n":37,"r":["1fc8ae707f","104cf07141","174a6e085d","1742236a5d","175164be5d","104e694441","1fd555557f","1663af00","67d7f2ed0","1d1b176a70","47130a980","161a22dd1e","772a16fdf","79e553f57","d494e9496","d238473f3","78a3680e","3374066c1","ad240ef97","8aaa2f27a","16d84d4592","519e23022","16c5a93490","1203560f8f","155dbb804d","b2eb4211d","9d9995f06","15925e1191","453eafbfc","10aabd1d","1fdd61895b","10455d631b","174323c5f8","175856cd5c","175d93427a","104b06fa0c","1fc655fc17"]},"folderoo":{"n":37,"r":["1fcb7a1d7f","1055b0d541","175b0ffe5d","175a19685d","175de3655d","105aa8fd41","1fd555557f","65bab00","4f4a238be","712fbe869","35002b2cd","d3ee0443a","5451b8269","29e3a7bc5","184a0c024d","1b3ba4e1ba","1fc63bb363","1a0d552fe5","1f5a1cc221","c3d6596e9","1aed3e2349","7a0841269","1bc99d7f3d","133534f6e8","2e9a22de8","8bc05452b","1cc24829e5","59b3a83c8","1a7acd71f1","102eb519","1fdab6e55d","105d127719","17406453f3","174a72d715","17532f5117","104cd1b328","1fcc1391a1"]}};
const NAMES={snip:"Snip",lastly:"Lastly",folderoo:"Folderoo"};
const GRASS=["#7cc84a","#62b33a","#93d65a","#56a832"], GRASS_CODE="#2f7a22";
const TH={
  snip:{leaves:[["#c8ff2e","#d9ff6b","#a8e61f","#b6f03a","#e4ff8c"]],code:["#3a7400","#2f6a08","#467f06"],fall:"#c8ff2e"},
  lastly:{leaves:[["#8fd14f","#a6dd63","#76c040"],["#ff8fc7","#ffb0d6","#f472b6","#ffc4e0"],["#9d8cff","#b9acff","#c9b8ff","#8a76f5"],["#ffa03a","#ffc46b","#f08a1c","#ffb057"]],code:["#4a3bb0","#a82a68","#b4530c"],fall:"#ff8fc7",seasons:true},
  folderoo:{leaves:[["#2fa597","#14857f","#4cc0ae","#3bb3a3","#E8A21F","#f6c453"]],code:["#0d4f4b","#0b4541","#7a4d00"],fall:"#E8A21F"}
};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const card=$("#qrLink"), cv=$("#qrCanvas"), holder=$("#qrTree"), logo=$("#qrLogo"), cap=$("#qrCap"), toggle=$("#qrToggle"), tabs=$$(".get-tab");
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
let app="snip", mode="code", three=null, scene=null;

function rnd(seed){let x=seed|0||1;return()=>((x^=x<<13,x^=x>>>17,x^=x<<5)>>>0)/4294967296}
function grid(a){const q=Q[a],N=q.n;return{N,M:N+8,dark:q.r.map(h=>BigInt("0x"+h).toString(2).padStart(N,"0"))}}
function crown(N){return{c:N/2,R:N*.43}}
function inCrown(x,y,N){const{c,R}=crown(N);return Math.hypot(x+.5-c,y+.5-c)<R}

/* crisp flat code: what phones actually scan */
function drawCode(){
  const {N,M,dark}=grid(app),th=TH[app],R=rnd(91),ctx=cv.getContext("2d");
  const dpr=Math.min(devicePixelRatio||1,2),W=cv.clientWidth||400,S=Math.round(W*dpr);cv.width=cv.height=S;
  const cell=S/M;ctx.fillStyle="#f6f1e7";ctx.fillRect(0,0,S,S);
  const c0=(N-7)/2;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    if(dark[y][x]!=="1")continue; if(x>=c0&&x<c0+7&&y>=c0&&y<c0+7)continue;
    ctx.fillStyle=inCrown(x,y,N)?th.code[(R()*th.code.length)|0]:GRASS_CODE;
    ctx.fillRect(Math.floor((x+4)*cell),Math.floor((y+4)*cell),Math.ceil(cell)+1,Math.ceil(cell)+1);
  }
}
function setApp(a){
  app=a;card.href="/get/"+a+"/";
  cv.setAttribute("aria-label","QR code that opens "+NAMES[a]+" on Google Play");
  cap.innerHTML="Scan for <b>"+NAMES[a]+"</b>";
  const s=$(".world."+a+" .art svg");logo.innerHTML=s?s.outerHTML:"";
  tabs.forEach(t=>t.setAttribute("aria-selected",t.dataset.app===a?"true":"false"));
  drawCode();
}
function showCode(instant){mode="code";card.classList.remove("tree");toggle.textContent="See the tree 🌳";if(instant)card.classList.add("snap");requestAnimationFrame(()=>card.classList.remove("snap"))}

/* ---------- 3D ---------- */
async function boot(){
  if(three||RM)return !!three;
  try{const c=document.createElement("canvas");if(!(c.getContext("webgl2")||c.getContext("webgl")))return false;
    three=await import("./three.module.min.js");}catch(e){console.warn("3D tree unavailable",e);return false}
  const T=three, r=new T.WebGLRenderer({antialias:true,alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
  holder.appendChild(r.domElement);
  const cam=new T.OrthographicCamera(-1,1,1,-1,.1,800);
  const sc=new T.Scene();
  sc.add(new T.HemisphereLight(0xfff6e8,0xb9a98e,1.9));
  const sun=new T.DirectionalLight(0xffffff,2.1);sun.position.set(-30,60,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sc.add(sun,sun.target);
  scene={T,r,cam,sc,sun,root:null,t0:0,raf:0,falling:null,az:0};
  addEventListener("resize",()=>{if(scene)size()});
  return true;
}
function size(){const {r}=scene,W=holder.clientWidth||400;r.setSize(W,W,false);r.domElement.style.width=r.domElement.style.height="100%"}
function build(){
  const {T,sc,sun}=scene;
  if(scene.root){sc.remove(scene.root);scene.root.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose&&o.material.dispose()})}
  const root=new T.Group();sc.add(root);scene.root=root;
  const {N,M,dark}=grid(app),th=TH[app],R=rnd(app.length*131+5),{c,R:CR}=crown(N);
  const H0=N*.6, VR=N*.5; scene.dims={M,H0};
  const col=new T.Color(),dummy=new T.Object3D();
  const X=x=>x+4-M/2+.5, Z=y=>y+4-M/2+.5;
  // stone slab
  const base=new T.Mesh(new T.BoxGeometry(M,1.4,M),new T.MeshLambertMaterial({color:0xcfc7b8}));base.position.y=-.7;base.receiveShadow=true;root.add(base);
  // tiles
  const tiles=new T.InstancedMesh(new T.BoxGeometry(.94,.28,.94),new T.MeshLambertMaterial(),M*M);tiles.receiveShadow=true;
  let i=0;for(let y=0;y<M;y++)for(let x=0;x<M;x++){dummy.position.set(x-M/2+.5,.14,y-M/2+.5);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);
    const g=.9+R()*.06;col.setRGB(g,g*.985,g*.95);tiles.setColorAt(i++,col)}
  root.add(tiles);
  // grass tufts on the dark modules outside the crown, leaves on the ones inside
  const grassPts=[],leafPts=[];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(dark[y][x]!=="1")continue;(inCrown(x,y,N)?leafPts:grassPts).push([x,y])}
  const blades=new T.InstancedMesh(new T.ConeGeometry(.17,1,3),new T.MeshLambertMaterial(),grassPts.length*9);blades.castShadow=true;
  i=0;for(const[x,y]of grassPts)for(let k=0;k<9;k++){const h=.8+R()*1.3;dummy.position.set(X(x)+(R()-.5)*.8,.28+h/2,Z(y)+(R()-.5)*.8);dummy.rotation.set((R()-.5)*.6,R()*6,(R()-.5)*.6);dummy.scale.set(1,h,1);dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);col.set(GRASS[(R()*GRASS.length)|0]);blades.setColorAt(i++,col)}
  root.add(blades);
  // trunk and branches
  const bark=new T.MeshLambertMaterial({color:0x6b4429});
  const trunk=new T.Mesh(new T.CylinderGeometry(.75,1.25,H0,8),bark);trunk.position.y=H0/2;trunk.castShadow=true;root.add(trunk);
  const twigs=new T.Group();root.add(twigs);
  for(let k=0;k<9;k++){const len=CR*(.45+R()*.35),ang=k/9*Math.PI*2+R()*.4,y=H0*(.45+R()*.45);
    const b=new T.Mesh(new T.CylinderGeometry(.12,.3,len,5),bark);b.castShadow=true;
    b.position.set(Math.cos(ang)*len*.42,y+len*.32,Math.sin(ang)*len*.42);b.lookAt(Math.cos(ang)*len,y+len*.9,Math.sin(ang)*len);b.rotateX(Math.PI/2);twigs.add(b)}
  // leaves: lots of soft little leaf shapes, densest where the code needs colour
  const leafGeo=new T.CircleGeometry(.55,5);leafGeo.scale(1,.72,1);
  const per=7,extra=1600,count=leafPts.length*per+extra;
  const leaves=new T.InstancedMesh(leafGeo,new T.MeshLambertMaterial({side:T.DoubleSide}),count);leaves.castShadow=true;
  const info=[];
  const putLeaf=(x,z,y,k)=>{dummy.position.set(x,y,z);dummy.rotation.set(R()*6,R()*6,R()*6);const s=.8+R()*.6;dummy.scale.set(s,s,s);dummy.updateMatrix();leaves.setMatrixAt(k,dummy.matrix);info.push({y,shade:.78+R()*.3,pick:R()})};
  i=0;
  for(const[x,y]of leafPts){const r=Math.hypot(x+.5-c,y+.5-c)/CR,h=Math.sqrt(Math.max(0,1-r*r));
    for(let k=0;k<per;k++){const top=k===0;putLeaf(X(x)+(R()-.5)*.7,Z(y)+(R()-.5)*.7,top?H0+VR*h*.95:H0+VR*h*(R()*1.9-1),i++)}}
  for(let k=0;k<extra;k++){ // inner fill
    let a=R()*Math.PI*2,rr=Math.sqrt(R())*CR*.92,hh=Math.sqrt(Math.max(0,1-(rr/CR)**2))*(.85+.25*Math.sin(a*3+1)*Math.cos(rr*.6));
    putLeaf(Math.cos(a)*rr,Math.sin(a)*rr,H0+VR*hh*(R()*1.6-1)*.95,i++)}
  root.add(leaves);
  // fallen leaves on the stones
  const fallenGeo=leafGeo.clone(),fallen=new T.InstancedMesh(fallenGeo,new T.MeshLambertMaterial({side:T.DoubleSide}),90);
  for(let k=0;k<90;k++){const a=R()*Math.PI*2,rr=Math.sqrt(R())*CR*1.05;dummy.position.set(Math.cos(a)*rr,.3,Math.sin(a)*rr);dummy.rotation.set(-Math.PI/2,0,R()*6);dummy.scale.setScalar(.7+R()*.4);dummy.updateMatrix();fallen.setMatrixAt(k,dummy.matrix)}
  root.add(fallen);
  // drifting leaves
  const drift=new T.InstancedMesh(leafGeo,new T.MeshLambertMaterial({side:T.DoubleSide}),36);const dd=[];
  for(let k=0;k<36;k++)dd.push({a:R()*6.3,r:R()*CR,y:R()*H0*1.5,v:2+R()*2.5,s:R()*6});
  root.add(drift);
  // sun shadow covers the garden
  const sh=sun.shadow.camera;sh.left=-M*.8;sh.right=M*.8;sh.top=M*.8;sh.bottom=-M*.8;sh.far=300;sh.updateProjectionMatrix();
  Object.assign(scene,{leaves,info,fallen,drift,dd,twigs,trunk});
  paint(0);
}
function palette(t){ // Lastly walks through the seasons; the others stay in their own colours
  const th=TH[app];if(!th.seasons)return th.leaves[0];
  const n=th.leaves.length,p=Math.max(0,t/3.2)%n;return th.leaves[Math.floor(p)%n];
}
function paint(t){
  const {T,leaves,info,fallen,drift}=scene,col=new T.Color(),pal=palette(t);
  info.forEach((d,k)=>{col.set(pal[Math.floor(d.pick*pal.length)]);col.multiplyScalar(d.shade);leaves.setColorAt(k,col)});leaves.instanceColor.needsUpdate=true;
  for(let k=0;k<90;k++){col.set(pal[k%pal.length]);fallen.setColorAt(k,col)}fallen.instanceColor.needsUpdate=true;
  for(let k=0;k<36;k++){col.set(pal[(k*3)%pal.length]);drift.setColorAt(k,col)}drift.instanceColor.needsUpdate=true;
  scene.pal=pal;
}
const ease=t=>t<0?0:t>1?1:t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function camAt(el,az,zoom,ty){
  const {cam,dims:{M}}=scene,d=200,ce=Math.cos(el);
  cam.position.set(Math.sin(az)*ce*d,Math.sin(el)*d+ty,Math.cos(az)*ce*d);cam.up.set(0,1,0);cam.lookAt(0,ty,0);
  const h=M/2*zoom;cam.left=-h;cam.right=h;cam.top=h;cam.bottom=-h;cam.updateProjectionMatrix();
}
let seq=null; // {t0, toCode:time or null}
function loop(now){
  const S=scene;if(!S)return;
  const t=typeof window.__qrT==="number"?window.__qrT:Math.max(0,(now-seq.t0)/1000); // __qrT: test hook to freeze time
  if(typeof window.__qrT==="number"&&S.lastT===t){S.raf=requestAnimationFrame(loop);return}S.lastT=t;
  // grow in
  const g=ease(t/1.4);S.root.scale.set(1,1,1);S.trunk.scale.set(1,Math.max(.01,g),1);S.trunk.position.y=S.dims.H0*g/2;
  S.leaves.scale.setScalar(1);S.leaves.position.y=0;S.leaves.visible=t>.5;S.twigs.scale.setScalar(Math.max(.01,ease((t-.3)/1)));
  S.leaves.scale.set(Math.max(.01,ease((t-.5)/1.1)),Math.max(.01,ease((t-.5)/1.1)),Math.max(.01,ease((t-.5)/1.1)));S.leaves.position.y=S.dims.H0*(1-S.leaves.scale.y);
  if(TH[app].seasons){const p=palette(t);if(p!==S.pal)paint(t)}
  // drifting leaves
  const m=new S.T.Object3D();S.dd.forEach((d,k)=>{d.y-=d.v*.016;if(d.y<.3)d.y=S.dims.H0*1.4;const a=d.a+t*.3;m.position.set(Math.cos(a)*d.r+Math.sin(t*2+d.s)*.6,d.y,Math.sin(a)*d.r);m.rotation.set(t*2+d.s,t*1.3,d.s);m.scale.setScalar(t>1.5?.9:0);m.updateMatrix();S.drift.setMatrixAt(k,m.matrix)});S.drift.instanceMatrix.needsUpdate=true;
  // camera: slow orbit, then (if asked) swing to straight overhead so it reads as the code
  const k=seq.toCode==null?0:ease((t-seq.toCode)/1.7);
  const spin=t*.32,TAU=Math.PI*2;
  if(seq.toCode!=null&&seq.target==null)seq.target=Math.ceil((seq.toCode*.32+1.7*.32)/TAU)*TAU;
  const az=seq.target==null?spin:spin+(seq.target-spin)*k;
  const el=.5+(Math.PI/2-.0015-.5)*k, zoom=1.24-.24*k, ty=S.dims.H0*.78*(1-k);
  camAt(el,az,zoom,ty);
  S.r.render(S.sc,S.cam);
  if(k>=1){showCode();cancelAnimationFrame(S.raf);S.raf=0;return}
  if(k>.72&&!card.classList.contains("fade"))card.classList.add("fade");
  S.raf=requestAnimationFrame(loop);
}
async function playTree(autoCode){
  if(!(await boot())){showCode(true);return}
  size();build();
  card.classList.remove("fade");card.classList.add("tree");mode="tree";toggle.textContent="Show the code";toggle.hidden=false;
  cancelAnimationFrame(scene.raf);seq={t0:performance.now(),toCode:autoCode?6.2:null,target:null};
  scene.raf=requestAnimationFrame(loop);
}
function toCode(){if(!scene||!seq){showCode();return}const t=(performance.now()-seq.t0)/1000;seq.toCode=Math.max(t,0);seq.target=null;if(!scene.raf)scene.raf=requestAnimationFrame(loop)}

/* ---------- wiring ---------- */
setApp("snip");
if(RM){toggle.hidden=true}
tabs.forEach(t=>t.addEventListener("click",()=>{setApp(t.dataset.app);if(!RM)playTree(true)}));
toggle.addEventListener("click",()=>{mode==="tree"?toCode():playTree(false)});
addEventListener("resize",()=>drawCode());
if(!RM&&"IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();playTree(true)}},{rootMargin:"0px 0px -25% 0px"});io.observe(card);
}
