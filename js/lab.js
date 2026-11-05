/* App 04 "in the lab" animation: nine named agent cursors draw and fill an app screen.
   Static content only (no outside text goes into innerHTML). Loops while on screen, pauses when off screen.
   With reduced motion it shows the finished screen with no movement. Usage: DKLab.mount(element). */
(function(){
"use strict";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const W=320,H=380,STEP=240,LOOP_HOLD=1800;
const A={Nova:"#8b7bff",Lumen:"#2ee6c8",Rhea:"#ff5c93",Juno:"#ffa03a",Mira:"#4aa8ff",Ada:"#3ddc97",Vega:"#ff7a59",Orion:"#c77dff",Kai:"#ffd23f"};
const HALF=(W-30)/2;
const REGIONS=[
  {a:"Nova",l:"Header",x:12,y:12,w:W-24,h:24,k:"head"},
  {a:"Lumen",l:"Filters",x:12,y:46,w:W-24,h:16,k:"chips"},
  {a:"Rhea",l:"Due soon",x:12,y:72,w:HALF,h:74,k:"kpi",v:"3"},
  {a:"Juno",l:"Saved",x:18+HALF,y:72,w:HALF,h:74,k:"kpi",v:"$42"},
  {a:"Mira",l:"Spending",x:12,y:156,w:W-24,h:62,k:"chart"},
  {a:"Ada",l:"Hydro bill",x:12,y:228,w:W-24,h:34,k:"row"},
  {a:"Vega",l:"Passport",x:12,y:270,w:W-24,h:34,k:"row"},
  {a:"Orion",l:"Insurance",x:12,y:312,w:W-24,h:34,k:"row"},
  {a:"Kai",l:"Add",x:W-56,y:296,w:40,h:40,k:"fab"},
  {a:"Nova",l:"Tabs",x:12,y:356,w:W-24,h:14,k:"tabs"}];
const STARTS=[[.18,.22],[.62,.14],[.36,.40],[.78,.36],[.12,.58],[.55,.62],[.30,.80],[.74,.82],[.86,.60]];
const rgba=(h,a)=>`rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
const CR="rgba(253,240,220,.85)",CL="rgba(253,240,220,.3)";

function inner(r){const c=A[r.a];
  if(r.k==="head")return `<div class="lb-row"><i class="lb-bar" style="width:64px;background:${CR};margin:0"></i><i class="lb-av" style="background:${c}"></i></div>`;
  if(r.k==="chips")return `<div class="lb-chips">${[30,44,36].map((w,i)=>`<i style="width:${w}px;background:${i?CL:c}"></i>`).join("")}</div>`;
  if(r.k==="kpi")return `<i class="lb-bar" style="width:45%;background:${CL}"></i><b class="lb-num">${r.v}</b><i class="lb-bar" style="width:65%;background:${c}"></i>`;
  if(r.k==="chart")return `<div class="lb-chart">${[40,55,35,70,60,85,95].map(h=>`<i style="height:${h}%;background:${c}"></i>`).join("")}</div>`;
  if(r.k==="row")return `<div class="lb-row"><i class="lb-ico" style="background:${c}"></i><span class="lb-txt"><i class="lb-bar" style="width:55%;background:${CR}"></i><i class="lb-bar" style="width:30%;background:${CL};margin:0"></i></span><i class="lb-pill" style="background:${CL}"></i></div>`;
  if(r.k==="fab")return `<b class="lb-plus">+</b>`;
  if(r.k==="tabs")return `<div class="lb-tabs">${[0,1,2,3].map(i=>`<i style="background:${i?CL:c}"></i>`).join("")}</div>`;
  return "";
}

let styled=false;
function css(){if(styled)return;styled=true;const s=document.createElement("style");s.textContent=`
.lab{position:relative;overflow:hidden}
.lb-scale{position:absolute;left:50%;top:50%;width:${W}px;height:${H}px;margin:-${H/2}px 0 0 -${W/2}px;transform-origin:50% 50%}
.lb-cv{position:absolute;inset:0;background-color:#141416;background-image:radial-gradient(rgba(255,255,255,.09) 1px,transparent 1.2px);background-size:14px 14px;border:1px solid #2a2a2e;border-radius:14px;overflow:hidden}
.lb-gh{position:absolute;border:1px dashed rgba(253,240,220,.16);border-radius:4px;transition:opacity .3s}
.lb-gh b{position:absolute;top:3px;left:5px;font:400 9px/1 var(--f-mono,ui-monospace,monospace);color:rgba(253,240,220,.3)}
.lb-rg{position:absolute;border:1.5px dashed var(--c);width:0;height:0;border-radius:4px;transition:width .4s ease,height .4s ease,background .3s,border-color .3s}
.lb-rg.fill{border-style:solid;border-color:transparent;background:var(--bgc)}
.lb-rg.round,.lb-gh.round{border-radius:50%}
.lb-tag,.lb-sz{position:absolute;font:500 10px/1.4 var(--f-mono,ui-monospace,monospace);color:#fff;background:var(--c);border-radius:3px;white-space:nowrap;opacity:0;transition:opacity .2s;z-index:3}
.lb-tag{top:-16px;left:-1px;padding:0 5px}.lb-sz{bottom:-15px;right:-1px;padding:0 4px}
.lb-in{position:absolute;inset:7px;opacity:0;transition:opacity .3s}
.lb-in i{display:block}
.lb-bar{height:6px;border-radius:3px;margin-bottom:5px}
.lb-row{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:-2px}
.lb-av{width:10px;height:10px;border-radius:50%}
.lb-chips{display:flex;gap:6px;margin-top:-5px}.lb-chips i{height:10px;border-radius:5px}
.lb-num{display:block;font:700 22px/1.1 var(--f-display,sans-serif);color:${CR};margin:4px 0}
.lb-chart{display:flex;align-items:flex-end;gap:6px;height:100%}.lb-chart i{flex:1;border-radius:3px 3px 0 0}
.lb-ico{width:20px;height:20px;border-radius:6px;flex:none}.lb-txt{flex:1}.lb-pill{width:34px;height:10px;border-radius:5px;flex:none}
.lb-plus{display:block;color:#141416;font:700 22px/24px sans-serif;text-align:center}
.lb-tabs{display:flex;justify-content:space-around;margin-top:-4px}.lb-tabs i{width:8px;height:8px;border-radius:50%}
.lb-cur{position:absolute;z-index:5;transition:left .45s cubic-bezier(.4,0,.2,1),top .45s cubic-bezier(.4,0,.2,1),opacity .4s}
.lb-cur span{position:absolute;left:12px;top:12px;font:500 10px/1.4 var(--f-mono,ui-monospace,monospace);color:#fff;background:var(--c);padding:0 6px;border-radius:10px}
.lb-pillbar{position:absolute;left:50%;bottom:-38px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:#1a1a1c;border:1px solid #2a2a2e;border-radius:20px;padding:5px 11px;font:11px/1 var(--f-mono,ui-monospace,monospace);color:#FDF0DC;white-space:nowrap}
.lb-pillbar .d{display:flex}.lb-pillbar .d i{width:9px;height:9px;border-radius:50%;margin-right:-4px;border:1.5px solid #1a1a1c}
.lb-prog{width:56px;height:4px;background:#333;border-radius:2px;overflow:hidden}.lb-prog b{display:block;height:100%;width:0;background:#FF9F3F;transition:width .3s}
.lab.withpill .lb-scale{height:${H+44}px;margin-top:-${(H+44)/2}px}.lab.withpill .lb-cv{bottom:44px}.lab.withpill .lb-pillbar{bottom:0}
`;document.head.appendChild(s)}

function mount(host,opts){
  if(!host||host.dataset.labOn)return;host.dataset.labOn="1";css();
  const pill=!!(opts&&opts.pill);
  host.classList.add("lab");if(pill)host.classList.add("withpill");host.setAttribute("aria-hidden","true");
  host.innerHTML=`<div class="lb-scale"><div class="lb-cv"></div>${pill?`<div class="lb-pillbar"><span class="d">${Object.values(A).map(c=>`<i style="background:${c}"></i>`).join("")}</span><span>9 agents</span><span class="lb-prog"><b></b></span><span class="lb-n">0/10</span></div>`:""}</div>`;
  const sc=host.querySelector(".lb-scale"),cv=host.querySelector(".lb-cv"),pb=host.querySelector(".lb-prog b"),pn=host.querySelector(".lb-n");
  const fit=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const s=Math.min(w/W,h/(H+(pill?44:0)),1.4)*.94;sc.style.transform=`scale(${s})`};
  fit();if("ResizeObserver" in window)new ResizeObserver(fit).observe(host);else addEventListener("resize",fit);
  let timers=[],visible=false,running=false;
  const T=(f,ms)=>timers.push(setTimeout(f,ms));
  const stop=()=>{timers.forEach(clearTimeout);timers=[];running=false};
  function build(finished){
    cv.innerHTML="";const ghosts=[],regs=[],curs={};
    REGIONS.forEach(r=>{const g=document.createElement("div");g.className="lb-gh"+(r.k==="fab"?" round":"");
      g.style.cssText=`left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`;if(r.h>=30&&r.k!=="fab")g.innerHTML=`<b>${r.l.toLowerCase()}</b>`;
      if(finished)g.style.opacity=0;cv.appendChild(g);ghosts.push(g)});
    REGIONS.forEach(r=>{const col=A[r.a],el=document.createElement("div");el.className="lb-rg"+(r.k==="fab"?" round":"");
      el.style.cssText=`left:${r.x}px;top:${r.y}px;--c:${col};--bgc:${r.k==="fab"?col:rgba(col,.14)};z-index:${r.k==="fab"?2:1}`;
      el.innerHTML=`<span class="lb-tag">${r.a} · ${r.l}</span><span class="lb-sz">${r.w|0} × ${r.h}</span><div class="lb-in">${inner(r)}</div>`;
      if(finished){el.style.width=r.w+"px";el.style.height=r.h+"px";el.classList.add("fill");el.querySelector(".lb-in").style.opacity=1;cv.appendChild(el)}
      regs.push(el)});
    if(!finished)Object.keys(A).forEach((n,i)=>{const c=document.createElement("div");c.className="lb-cur";c.style.setProperty("--c",A[n]);
      c.style.left=STARTS[i][0]*W+"px";c.style.top=STARTS[i][1]*H+"px";
      c.innerHTML=`<svg width="14" height="16" viewBox="0 0 14 16"><path d="M1 1l11 6-5 1.5L5 14z" fill="${A[n]}" stroke="#fff" stroke-width="1.2"/></svg><span>${n}</span>`;
      cv.appendChild(c);curs[n]=c});
    if(pb){pb.style.width=finished?"100%":"0";pn.textContent=(finished?10:0)+"/10"}
    return {ghosts,regs,curs};
  }
  function play(){
    stop();running=true;const {ghosts,regs,curs}=build(false);let done=0;
    REGIONS.forEach((r,i)=>{const t0=i*STEP,c=curs[r.a],el=regs[i];
      T(()=>{c.style.left=r.x+"px";c.style.top=r.y+"px"},t0);
      T(()=>{cv.appendChild(el);ghosts[i].style.opacity=0;el.querySelector(".lb-tag").style.opacity=1;
        requestAnimationFrame(()=>{el.style.width=r.w+"px";el.style.height=r.h+"px";c.style.left=(r.x+r.w-4)+"px";c.style.top=(r.y+r.h-4)+"px"})},t0+450);
      T(()=>{el.querySelector(".lb-sz").style.opacity=1},t0+850);
      T(()=>{el.classList.add("fill");el.querySelector(".lb-tag").style.opacity=0;el.querySelector(".lb-sz").style.opacity=0;el.querySelector(".lb-in").style.opacity=1;
        done++;if(pb){pb.style.width=done*10+"%";pn.textContent=done+"/10"}},t0+1250);
    });
    const end=REGIONS.length*STEP+1500;
    T(()=>Object.values(curs).forEach(c=>{c.style.opacity=0}),end);
    T(()=>{running=false;if(visible)play()},end+LOOP_HOLD);
  }
  if(RM){build(true);return}
  build(false);
  if("IntersectionObserver" in window){
    new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!running)play();if(!visible)stop()},{threshold:.25}).observe(host);
  }else{visible=true;play()}
}
/* small static icon of the agents' screen, for the orbiting app tiles */
function icon(){
  const blocks=[[6,6,48,6,"#8b7bff"],[6,16,22,14,"#ff5c93"],[32,16,22,14,"#ffa03a"],[6,34,48,10,"#4aa8ff"],[6,48,48,6,"#3ddc97"],[6,58,48,6,"#ff7a59"]];
  return `<svg viewBox="0 0 60 70" aria-hidden="true"><rect width="60" height="70" rx="9" fill="#141416" stroke="#2a2a2e"/>${blocks.map(([x,y,w,h,c])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width=".8"/>`).join("")}<path d="M40 38l9 5-4 1.2-1.6 4z" fill="#ffd23f" stroke="#fff" stroke-width=".7"/><path d="M14 20l9 5-4 1.2-1.6 4z" fill="#2ee6c8" stroke="#fff" stroke-width=".7"/></svg>`;
}
window.DKLab={mount,icon};
})();
