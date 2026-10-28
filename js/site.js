(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>"$"+v.toFixed(2);
const safe=(name,fn)=>{try{fn()}catch(e){console.error("["+name+"]",e)}};
const G=window.gsap, ST=window.ScrollTrigger, FL=window.Flip;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const motion=!!(G&&ST)&&!RM;
if(G){G.registerPlugin(...[ST,FL].filter(Boolean))}

/* ---------- helpers ---------- */
function splitChars(el){
  const text=el.textContent;el.textContent="";
  return [...text].map(ch=>{const m=document.createElement("span");m.className="mask";const s=document.createElement("span");s.textContent=ch===" "?" ":ch;m.appendChild(s);el.appendChild(m);return s});
}
function fitWord(el){el.style.fontSize="100px";const w=el.getBoundingClientRect().width;const avail=el.parentElement.clientWidth;if(w>0)el.style.fontSize=(100*avail/w*.995)+"px"}

/* ---------- static content builders (always run) ---------- */
safe("marquee-build",()=>{
  const A=["Snip","Lastly","Folderoo","Free to start","Pay once","Android first","iOS next"], B=["One app","One job","No clutter","Small fixes","Big relief","Made in Canada"];
  const dots=["a","b","c","d"];
  const make=items=>items.map((t,i)=>`<span class="${i%2?"o":""}">${t}<em class="${dots[i%4]}"></em></span>`).join("");
  $("#m1").innerHTML=make(A).repeat(2);$("#m2").innerHTML=make(B).repeat(2);
});
const bigLetters=[];
safe("big-build",()=>{
  const big=$("#big");
  [..."Say hello."].forEach(ch=>{const s=document.createElement("span");s.setAttribute("aria-hidden","true");if(ch===" ")s.className="sp";else{s.textContent=ch;if(ch===".")s.className="dotc";bigLetters.push(s)}big.appendChild(s)});
});
const footWord=$("#footword");let footLetters=[];
safe("big-fit",()=>{const big=$("#big");const fit=()=>{big.style.fontSize="";const cs=parseFloat(getComputedStyle(big).fontSize);const avail=big.parentElement.clientWidth;big.style.width="max-content";const w=big.scrollWidth;big.style.width="";if(w>avail)big.style.fontSize=(cs*avail/w*.97)+"px"};fit();addEventListener("resize",fit);document.fonts&&document.fonts.ready.then(fit)});
safe("foot-build",()=>{footWord.innerHTML=[..."DRAKIVERSE"].map(c=>`<span aria-hidden="true">${c}</span>`).join("");footLetters=$$("span",footWord);fitWord(footWord);addEventListener("resize",()=>fitWord(footWord));document.fonts&&document.fonts.ready.then(()=>{fitWord(footWord);ST&&ST.refresh()})});

/* ---------- nav pill + copy (no library needed) ---------- */
safe("navpill",()=>{
  const pill=$("#navpill"),links=$$("#navlinks a");
  links.forEach(a=>{const on=()=>{links.forEach(l=>l.classList.toggle("hot",l===a));const st={width:a.offsetWidth+"px",x:a.offsetLeft,opacity:1};
    if(G)G.to(pill,{...st,duration:.45,ease:"back.out(1.6)"});else Object.assign(pill.style,{width:st.width,transform:`translateX(${st.x}px)`,opacity:1})};
    a.addEventListener("pointerenter",on);a.addEventListener("focus",on);a.addEventListener("blur",()=>{a.classList.remove("hot");pill.style.opacity=0})});
  $("#navlinks").addEventListener("pointerleave",()=>{links.forEach(l=>l.classList.remove("hot"));G?G.to(pill,{opacity:0,duration:.2}):pill.style.opacity=0});
});
safe("copy-apps",()=>{
  $$("[data-copy-text]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.copyText;const ok=()=>{b.textContent="Copied";if(G)G.fromTo(b,{scale:.85},{scale:1,duration:.6,ease:"elastic.out(1,.4)"});setTimeout(()=>b.textContent="Copy",2000)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);const x=getSelection();x.removeAllRanges();x.addRange(r)};
    try{navigator.clipboard.writeText(v).then(ok,sel)}catch(e){sel()}}));
});
safe("copy-icons",()=>{
  const live=$("#copyLive");
  $$("[data-copy-email]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.copyEmail;
    const ok=()=>{live.textContent=v+" copied ✓";b.classList.add("copied");if(G)G.fromTo(b,{scale:.88},{scale:1,duration:.6,ease:"elastic.out(1,.4)"});clearTimeout(b._t);b._t=setTimeout(()=>{b.classList.remove("copied");if(live.textContent.startsWith(v))live.textContent=""},2400)};
    const fail=()=>{live.textContent="Email: "+v};
    try{navigator.clipboard.writeText(v).then(ok,fail)}catch(e){fail()}}));
});
safe("copy",()=>{
  const btn=$("#copy"),live=$("#copyLive"),mail=$("#mail");
  btn.addEventListener("click",()=>{const ok=()=>{btn.textContent="Copied";live.textContent="Email copied";if(G)G.fromTo(btn,{scale:.9},{scale:1,duration:.6,ease:"elastic.out(1,.4)"});setTimeout(()=>{btn.textContent="Copy";live.textContent=""},2200)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(mail);const s=getSelection();s.removeAllRanges();s.addRange(r);live.textContent="Email selected, copy it from here"};
    try{navigator.clipboard.writeText(mail.textContent.trim()).then(ok,sel)}catch(e){sel()}});
});

/* ---------- Snip demo (works with or without GSAP) ---------- */
safe("demo",()=>{
  const SUBS=[{id:1,name:"Video streaming",cat:"Entertainment",price:16.49,c:"V"},{id:2,name:"Music",cat:"Entertainment",price:11.99,c:"M"},{id:3,name:"Gym membership",cat:"Health",price:45,c:"G"},{id:4,name:"Cloud storage",cat:"Utilities",price:3.99,c:"C"},{id:5,name:"Language app",cat:"Learning",price:14.99,c:"L"},{id:6,name:"News",cat:"Reading",price:8,c:"N"},{id:7,name:"Meal kit",cat:"Food",price:69.99,c:"K"}];
  const TOTAL=SUBS.reduce((a,s)=>a+s.price,0);
  const list=$("#subs"),empty=$("#empty"),restore=$("#restore"),live=$("#demoLive"),tM=$("#tMonth"),tS=$("#tSaved"),toast=$("#toast"),toastText=$("#toastText");
  const active=new Set(SUBS.map(s=>s.id)), shown={m:TOTAL,s:0};
  const sc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>';
  const li=s=>{const e=document.createElement("li");e.className="sub";e.dataset.id=s.id;e.dataset.flipId="s"+s.id;e.innerHTML=`<span class="sico" aria-hidden="true">${s.c}</span><span class="smain"><b>${s.name}</b><small>${s.cat}</small></span><span class="sprice">${money(s.price)}<small>/mo</small></span><button class="cut" type="button" aria-label="Cut ${s.name}">${sc}</button>`;return e};
  SUBS.forEach(s=>list.appendChild(li(s)));
  const render=()=>{tM.textContent=money(shown.m);tS.textContent=money(shown.s)};
  function totals(msg){const m=SUBS.filter(s=>active.has(s.id)).reduce((a,s)=>a+s.price,0);const sv=(TOTAL-m)*12;
    if(G)G.to(shown,{m,s:sv,duration:.9,ease:"power3.out",onUpdate:render,overwrite:true});else{shown.m=m;shown.s=sv;render()}
    empty.hidden=active.size>0;if(!active.size)empty.textContent=`All cut. That's ${money(TOTAL*12)} a year back in your pocket.`;restore.hidden=active.size===SUBS.length;if(msg)live.textContent=msg+` You now pay ${money(m)} a month.`}
  let lastCut=null,tt;
  const showToast=on=>{if(G)G.to(toast,{yPercent:on?0:160,xPercent:-50,x:0,duration:on?.6:.3,ease:on?"back.out(1.7)":"power2.in"});toast.style.transform=G?toast.style.transform:(on?"translate(-50%,0)":"translate(-50%,160%)")};
  if(G)G.set(toast,{xPercent:-50,yPercent:160,left:"50%",x:0});
  function cut(id){const el=list.querySelector(`[data-id="${id}"]`);if(!el||el.dataset.gone)return;el.dataset.gone=1;const s=SUBS.find(x=>x.id===id);active.delete(id);totals(`Cut ${s.name}.`);
    lastCut=s;toastText.textContent=`Saved ${money(s.price*12)} a year`;showToast(true);clearTimeout(tt);tt=setTimeout(()=>showToast(false),4500);
    if(motion&&FL){const state=FL.getState(".sub");el.style.display="none";FL.from(state,{duration:.6,ease:"power3.inOut",absolute:true,onLeave:els=>G.to(els,{opacity:0,x:-140,rotation:-6,duration:.4,ease:"power2.in"}),onComplete:()=>el.remove()})}
    else el.remove()}
  function insert(s,delay=0){if(list.querySelector(`[data-id="${s.id}"]`))return;const e=li(s);const state=motion&&FL?FL.getState(".sub"):null;const next=$$(".sub",list).find(x=>+x.dataset.id>s.id);list.insertBefore(e,next||null);
    if(state)FL.from(state,{duration:.6,ease:"power3.inOut",onEnter:els=>G.fromTo(els,{opacity:0,scale:.85,y:-20},{opacity:1,scale:1,y:0,duration:.6,delay,ease:"back.out(1.6)"})})}
  list.addEventListener("click",e=>{const b=e.target.closest(".cut");if(b)cut(+b.closest(".sub").dataset.id)});
  $("#undo").addEventListener("click",()=>{if(!lastCut)return;const s=lastCut;lastCut=null;active.add(s.id);insert(s);totals(`Restored ${s.name}.`);showToast(false);clearTimeout(tt)});
  restore.addEventListener("click",()=>{let k=0;SUBS.forEach(s=>{if(!active.has(s.id)){active.add(s.id);insert(s,k++*.06)}});totals("Restored all.");showToast(false)});
});

/* ---------- detail panel (card → full screen) ---------- */
safe("detail",()=>{
  const LOGO_S='<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="cl2"><polygon points="0,0 56,0 38,100 0,100"/></clipPath><clipPath id="cr2"><polygon points="64,0 100,0 100,100 46,100"/></clipPath></defs><rect width="100" height="100" rx="24" fill="#0b0b0b"/><g clip-path="url(#cl2)"><rect x="14" y="26" width="72" height="48" rx="9" fill="#c8ff2e"/><rect x="14" y="36" width="72" height="8" fill="#0b0b0b"/></g><g clip-path="url(#cr2)" transform="translate(3,-2)"><rect x="14" y="26" width="72" height="48" rx="9" fill="#c8ff2e"/><rect x="14" y="36" width="72" height="8" fill="#0b0b0b"/></g></svg>';
  const LOGO_F='<svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="27" fill="#0A4441"/><ellipse cx="58" cy="107" rx="24" ry="3.2" fill="#07302E"/><g transform="translate(2 -8) rotate(-14 60 70)"><path d="M42 90 Q24 98 12 86 Q26 91 44 82 Z" fill="#E8A21F"/><ellipse cx="54" cy="99" rx="17" ry="5" fill="#E8A21F" transform="rotate(18 54 99)"/><ellipse cx="58" cy="72" rx="23" ry="26" fill="#E8A21F"/><ellipse cx="69" cy="48" rx="8" ry="13" fill="#E8A21F" transform="rotate(28 69 48)"/><ellipse cx="66" cy="23" rx="4.2" ry="9.5" fill="#E8A21F" transform="rotate(-34 66 23)"/><ellipse cx="66" cy="24" rx="1.9" ry="5.8" fill="#F3A6A0" transform="rotate(-34 66 24)"/><ellipse cx="73" cy="21" rx="4.2" ry="9.5" fill="#E8A21F" transform="rotate(-20 73 21)"/><ellipse cx="73" cy="22" rx="1.9" ry="5.8" fill="#F3A6A0" transform="rotate(-20 73 22)"/><ellipse cx="75" cy="36" rx="12" ry="10" fill="#E8A21F"/><ellipse cx="85" cy="40" rx="8" ry="6" fill="#E8A21F"/><circle cx="78" cy="33" r="2.3" fill="#17323A"/><circle cx="92" cy="39" r="2" fill="#17323A"/><ellipse cx="81" cy="60" rx="3.5" ry="8" fill="#E8A21F" transform="rotate(-70 81 60)"/><path d="M39 62 h12 a2 2 0 0 1 1.6 0.8 l2.8 3.6 h20.6 a3 3 0 0 1 3 3 v21 a5 5 0 0 1 -5 5 H44 a5 5 0 0 1 -5 -5 Z" fill="#0A4441"/><rect x="47" y="55" width="23" height="27" rx="2.8" fill="#FFFFFF" transform="rotate(-6 58 68)"/><rect x="51" y="60" width="13" height="2.6" rx="1.3" fill="#B9CBC8" transform="rotate(-6 58 68)"/><rect x="51" y="65.5" width="9" height="2.6" rx="1.3" fill="#B9CBC8" transform="rotate(-6 58 68)"/><path d="M39 76 Q59.5 86 79 76 V91 a5 5 0 0 1 -5 5 H44 a5 5 0 0 1 -5 -5 Z" fill="#5FC4B8"/></g></svg>';
  const LOGO_L='<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#fff1dc" stroke="#0b0b0c" stroke-opacity=".12"/><path d="M28 22V78H78" fill="none" stroke="#9d8cff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 22V67H78" fill="none" stroke="#ff8fc7" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 22V56H78" fill="none" stroke="#ffa03a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const D={
    snip:{tone:"snip",num:"App 01 · Coming to Google Play",name:"Snip",logo:LOGO_S,kick:"A subscription tracker.",body:"Snip puts every recurring charge in one list, warns you before something renews, and shows what you really spend each month and each year.",feats:["Every subscription in one list","A heads-up before anything renews","Monthly and yearly totals","Free. Snip Pro is a one-time purchase."],cta:["#demo","Try the live demo"],ext:[["https://play.google.com/store/apps/details?id=app.snip.tracker","View on Google Play"],["https://drakiverse.studio/snipapp/","Screenshots & details"]]},
    lastly:{tone:"lastly",num:"App 02 · Coming soon to Google Play",name:"Lastly",logo:LOGO_L,kick:"An all-in-one expiry tracker.",body:"If it expires or comes due, it goes in Lastly. Passports, warranties, insurance, food, medication and upcoming bills, all counting down, with reminders before the date, not after.",feats:["Documents, warranties and insurance","Food and medication","Upcoming bills","Free for 5 items. Pro unlock for $3.99."],cta:["#lastly","Watch time pass"],ext:[["https://drakiverse.studio/lastly/","Screenshots & details"]]},
    folderoo:{tone:"folderoo",num:"App 03 · Coming soon to Google Play",name:"Folderoo",logo:LOGO_F,kick:"A claim tracker with reminders.",body:"Dealing with an insurance claim? Folderoo keeps every date, call, letter and document in one place, reminds you before forms and appeals are due, and turns it all into a clean PDF when you need it. Disability, auto, home, travel, workers' comp and more. It's an organizer, not advice, and everything stays on your phone.",feats:["Deadlines with reminders until done","Calls, letters and appointments on one timeline","Symptom diary and a one-tap PDF summary","Free for one claim. Pro unlock for $9.99."],cta:["#contact","Ask a question"],ext:[["https://drakiverse.studio/folderoo/","Screenshots & details"]]},
    next:{tone:"",num:"App 04 · In the lab",name:"Next",logo:"",kick:"The next small fix.",body:"We keep a running list of little things that waste people's time. If something bugs you every week and an app could make it go away, tell us.",feats:["One problem per app","Android first, iOS next","Free to start, fair to upgrade","Your idea could be App 04"],cta:["#contact","Suggest an idea"]}
  };
  const det=$("#detail");let state=null;
  const inset=r=>{const vw=document.documentElement.clientWidth,vh=innerHeight;return `inset(${r.top}px ${vw-r.right}px ${vh-r.bottom}px ${r.left}px round 30px)`};
  function open(id,btn){const w=D[id],card=btn.closest(".world");state={btn,card};
    det.className="detail gut "+w.tone;
    det.innerHTML=`<div class="dinner"><div class="dbar di"><span class="idx">${w.num}</span><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="dtitle di">${w.logo}<h2 id="dTitle">${w.name}</h2></div><p class="kick di">${w.kick}</p><p class="dbody di">${w.body}</p>
      <ul class="feats">${w.feats.map((f,i)=>`<li class="di"><span>0${i+1}</span>${f}</li>`).join("")}</ul>
      <div class="dctas di"><a class="dbtn solid" href="${w.cta[0]}" data-jump="${w.cta[0]}">${w.cta[1]}</a>${(w.ext||[]).map(([h,t])=>`<a class="dbtn" href="${h}" target="_blank" rel="noopener">${t} ↗</a>`).join("")}<button class="dbtn" type="button" data-back>Back to the apps</button></div></div>`;
    det.hidden=false;det.scrollTop=0;document.documentElement.style.overflow="hidden";
    if(motion){const tl=G.timeline();tl.fromTo(det,{clipPath:inset(card.getBoundingClientRect())},{clipPath:"inset(0px 0px 0px 0px round 0px)",duration:.95,ease:"expo.inOut"})
      .from($$(".di",det),{y:60,opacity:0,duration:.8,stagger:.06,ease:"expo.out"},"-=.45")}
    setTimeout(()=>{const c=$(".close",det);c&&c.focus({preventScroll:true})},60)}
  function close(then){if(!state)return;const {btn,card}=state;state=null;
    const done=()=>{det.hidden=true;det.innerHTML="";document.documentElement.style.overflow="";if(then)then();else btn.focus({preventScroll:true})};
    if(motion){G.timeline({onComplete:done}).to($$(".di",det),{opacity:0,y:-20,duration:.2,stagger:.015}).to(det,{clipPath:inset(card.getBoundingClientRect()),duration:.6,ease:"expo.inOut"},"-=.05")}else done()}
  $$("[data-open]").forEach(b=>b.addEventListener("click",()=>open(b.dataset.open,b)));
  det.addEventListener("click",e=>{if(e.target.closest(".close")||e.target.closest("[data-back]"))close();const j=e.target.closest("[data-jump]");if(j){e.preventDefault();const h=j.dataset.jump;close(()=>{const el=$(h);el&&el.scrollIntoView({behavior:RM?"auto":"smooth"})})}});
  addEventListener("keydown",e=>{if(!state)return;if(e.key==="Escape")close();if(e.key==="Tab"){const f=$$("a,button",det);const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
});


/* ---------- legal & help sheet (hash routes: #privacy #terms #help) ---------- */
safe("sheet",()=>{
  const EMAIL="hello@drakiverse.studio", SNIP="snip@drakiverse.studio", LASTLY="lastly@drakiverse.studio", FOLDEROO="folderoo@drakiverse.studio", UPD="Last updated October 26, 2026";
  const box=(addr,label)=>`<div class="mailbox">${label?`<b class="k">${label}</b>`:""}<span>${addr}</span><button class="copy" type="button" data-copy="${addr}">Copy</button></div>`;
  const mailbox=box(EMAIL);
  const allMail=`<div class="mails">${box(EMAIL,"General")}${box(SNIP,"Snip")}${box(LASTLY,"Lastly")}${box(FOLDEROO,"Folderoo")}</div>`;
  const sec=(c,t,body)=>`<h3 class="si"><i style="background:var(${c})"></i>${t}</h3>${body}`;
  const PAGES={
    privacy:{title:"Privacy Policy",html:`<p class="intro si">Drakiverse Studio makes small apps that respect your privacy. This policy explains what happens to your information when you use our apps and this website.</p>
      ${sec("--fg","Who we are",`<p class="si">Drakiverse Studio is an independent app developer based in Canada. You can reach us any time at ${EMAIL}, or at ${SNIP}, ${LASTLY} and ${FOLDEROO} for app-specific questions.</p>`)}
      ${sec("--snip","Snip",`<ul class="si"><li><strong>Your data stays on your phone.</strong> The subscriptions you add are stored on your device. We don't run servers, so we never receive them.</li><li><strong>No account needed.</strong> Snip doesn't ask you to sign up or log in.</li><li><strong>We don't sell or share personal information.</strong> We don't collect it in the first place.</li><li><strong>Purchases go through Google Play.</strong> If you buy Snip Pro, Google handles the payment. We never see your card details.</li></ul><p class="si">Snip also has its own app privacy policy at <a href="https://drakiverse.studio/snipapp/privacy.html" target="_blank" rel="noopener">drakiverse.studio/snipapp/privacy.html</a>.</p>`)}
      ${sec("--purple","Lastly",`<ul class="si"><li><strong>Your data stays on your phone.</strong> Items, bills, people, notes and photos are stored on your device. We don't run servers, so we never receive them.</li><li><strong>No account, no bank login.</strong></li><li><strong>Purchases go through Google Play.</strong> We never see your card details.</li></ul><p class="si">Lastly also has its own app privacy policy at <a href="https://drakiverse.studio/lastly/privacy" target="_blank" rel="noopener">drakiverse.studio/lastly/privacy</a>.</p>`)}
      ${sec("--gold","Folderoo",`<ul class="si"><li><strong>Your data stays on your phone.</strong> Claims, notes, diary check-ins, documents and photos are stored on your device. We don't run servers, so we never receive them.</li><li><strong>No account needed.</strong></li><li><strong>Backups are yours.</strong> Encrypted backup files are protected by a password only you know, and you choose where to keep them.</li><li><strong>Purchases go through Google Play.</strong> We never see your card details.</li></ul><p class="si">Folderoo also has its own app privacy policy at <a href="https://drakiverse.studio/folderoo/privacy" target="_blank" rel="noopener">drakiverse.studio/folderoo/privacy</a>.</p>`)}
      ${sec("--pink","This website",`<p class="si">This site has no sign-up and no contact forms. It loads fonts from Google Fonts and code from a public content network (cdnjs), which means those services receive standard technical information such as your IP address when the page loads.</p>`)}
      ${sec("--orange","Children",`<p class="si">Our apps are general-audience tools and aren't designed for children under 13. We don't knowingly collect information from anyone.</p>`)}
      ${sec("--fg","Changes and contact",`<p class="si">If this policy changes, we'll update this page and the date above. Questions? Write to us.</p><div class="si">${mailbox}</div>`)}`},
    terms:{title:"Terms of Service",html:`<p class="intro si">These terms apply when you use apps made by Drakiverse Studio, including Snip, Lastly and Folderoo. By using our apps, you agree to them.</p>
      ${sec("--snip","Using our apps",`<p class="si">You can use the free version of each app for personal use. Please don't copy, resell or reverse-engineer the apps.</p>`)}
      ${sec("--purple","One-time purchases",`<p class="si">Upgrades like Snip Pro are a single, one-time purchase made through Google Play (and later the App Store). They're tied to your store account, so you can restore them on a new phone. Refunds follow the store's refund policy.</p>`)}
      ${sec("--pink","Reminders are a helping hand",`<p class="si">Our apps help you keep track of renewals, bills and expiry dates, but notifications can be delayed or missed, for example if your phone is off or notifications are disabled. Please don't rely on our apps as your only reminder for important dates like passport renewals or bill payments.</p>`)}
      ${sec("--orange","No warranty",`<p class="si">The apps are provided "as is". We work hard to keep them accurate and reliable, but we can't guarantee they'll always be error-free. To the extent the law allows, Drakiverse Studio isn't liable for losses caused by using or being unable to use the apps.</p>`)}
      ${sec("--fg","Changes and governing law",`<p class="si">We may update these terms as our apps evolve, and we'll change the date above when we do. These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply there.</p><div class="si">${mailbox}</div>`)}`},
    help:{title:"Help & Support",html:`<p class="intro si">Got a question or found a bug? Start here. If you can't find the answer, email us and we'll get back to you.</p>
      <div class="faq si">
        <details><summary>Does Folderoo give advice about my claim?</summary><p>No. Folderoo is a personal organizer: you record your own dates, calls and documents, and it reminds you. It doesn't give legal, medical or insurance advice and isn't connected to any insurer.</p></details>
        <details><summary>Is Snip free?</summary><p>Yes. Snip is free to use. Snip Pro is an optional one-time purchase, not a subscription.</p></details>
        <details><summary>Where is my data stored?</summary><p>On your phone. We don't run servers and you don't need an account, so your subscriptions, items and claims never leave your device.</p></details>
        <details><summary>I bought Pro. How do I get it on a new phone?</summary><p>Sign in to Google Play with the same Google account you used to buy it, reinstall the app, and your purchase will be restored.</p></details>
        <details><summary>When are Lastly and Folderoo coming out?</summary><p>Both are built and in testing now, and are coming soon to Google Play. Email us if you'd like to hear the day it launches.</p></details>
        <details><summary>Are your apps on iPhone?</summary><p>Not yet. We're launching on Android first, and iOS is on the way.</p></details>
        <details><summary>Can I suggest an app idea?</summary><p>Please do. If an everyday annoyance bugs you every week, tell us. It might become App 04.</p></details>
      </div>
      ${sec("--snip","Contact us",`<p class="si">For help with an app, email its support address. For anything else, say hello. Including your phone model and the app version helps us fix things faster.</p><div class="si">${allMail}</div>`)}`}
  };
  const sh=$("#sheet");let current=null,lastFocus=null;
  const tabs=k=>Object.entries(PAGES).map(([id,p])=>`<a href="#${id}" ${id===k?'aria-current="page"':""}>${p.title}</a>`).join("");
  function fill(k){const p=PAGES[k];sh.innerHTML=`<div class="sheet-bar gut"><div class="wrap"><nav class="sheet-tabs" aria-label="Legal and support pages">${tabs(k)}</nav><button class="close" type="button" aria-label="Close" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></div>
    <div class="sheet-in gut"><p class="label si">Drakiverse Studio</p><h2 id="sheetTitle" class="si">${p.title}</h2><p class="label upd si">${UPD}</p>${p.html}</div>`;sh.scrollTop=0}
  function open(k){
    if(current===k)return;const first=!current;current=k;
    if(first){lastFocus=document.activeElement;fill(k);sh.hidden=false;document.documentElement.style.overflow="hidden";
      if(motion){G.timeline().fromTo(sh,{yPercent:100,borderRadius:"40px 40px 0 0"},{yPercent:0,borderRadius:"0px 0px 0 0",duration:.9,ease:"expo.out"}).from($$(".si",sh),{y:40,opacity:0,duration:.7,stagger:.04,ease:"expo.out"},"-=.5")}}
    else{if(motion){G.to($$(".sheet-in",sh),{opacity:0,y:-20,duration:.2,onComplete:()=>{fill(k);G.from($$(".si",sh),{y:30,opacity:0,duration:.6,stagger:.035,ease:"expo.out"})}})}else fill(k)}
    setTimeout(()=>{const c=$("[data-close]",sh);c&&c.focus({preventScroll:true})},80)}
  function close(){if(!current)return;current=null;
    const done=()=>{sh.hidden=true;sh.innerHTML="";document.documentElement.style.overflow="";lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})};
    try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
    if(motion)G.to(sh,{yPercent:100,duration:.6,ease:"expo.in",onComplete:done});else done()}
  const route=()=>{const k=location.hash.slice(1);if(PAGES[k])open(k);else if(current)close()};
  addEventListener("hashchange",route);route();
  sh.addEventListener("click",e=>{if(e.target.closest("[data-close]"))close();
    const cp=e.target.closest("[data-copy]");if(cp){const done=()=>{cp.textContent="Copied";setTimeout(()=>cp.textContent="Copy",2000)};try{navigator.clipboard.writeText(cp.dataset.copy).then(done,()=>{const r=document.createRange();r.selectNodeContents(cp.previousElementSibling);getSelection().removeAllRanges();getSelection().addRange(r)})}catch(err){}}});
  addEventListener("keydown",e=>{if(!current)return;if(e.key==="Escape")close();if(e.key==="Tab"){const f=$$("a,button,summary",sh);const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
});

/* ---------- Lastly time-lapse update fn (used by scroll or shown static) ---------- */
const lastlyState={t:0};
function renderLastly(){
  const days=$("#days"),arc=$("#arc"),items=$$("#items .item");
  const el=Math.round(lastlyState.t);const pass=Math.max(0,214-el);
  days.textContent=pass;arc.style.strokeDashoffset=(540.35*(1-pass/214)).toFixed(1);
  items.forEach(it=>{const left=+it.dataset.d-el;const tag=it.querySelector(".left");const done=left<=0;
    if(done!==it.classList.contains("done")){it.classList.toggle("done",done);if(G&&motion)G.fromTo(tag,{scale:1.35},{scale:1,duration:.6,ease:"elastic.out(1,.4)"})}
    tag.textContent=done?(it.dataset.d==="6"?"Paid ✓":"Handled ✓"):left+(left===1?" day":" days")});
  const ln=$("#lnote");const show=pass<=142&&pass>=95;if(ln.dataset.on!==String(show)){ln.dataset.on=show;if(G)G.to(ln,{opacity:show?1:0,y:show?0:-12,duration:.4,ease:"back.out(1.7)"});else ln.style.opacity=show?1:0}
}

/* Folderoo section: 0..0.5 the kangaroo hops across claim types, then the claim board fills */
const rooState={t:0};let rooTile=-1;
function placeRoo(i,frac){
  const grid=$("#ctGrid"),roo=$("#ctRoo"),tiles=$$("#ctGrid .ct");if(!tiles.length)return;
  const box=$("#cTypes").getBoundingClientRect();
  const pos=k=>{const r=tiles[Math.max(0,Math.min(tiles.length-1,k))].getBoundingClientRect();return{x:r.left-box.left+r.width/2-roo.offsetWidth/2,y:r.top-box.top-roo.offsetHeight*.8}};
  const a=pos(i),b=pos(i+1),f=i>=tiles.length-1?0:frac;
  const x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f-Math.sin(Math.PI*f)*54;
  roo.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(f>0&&f<1?-8*Math.cos(Math.PI*f):0).toFixed(1)}deg)`;
}
function renderRoo(){
  const t=rooState.t,tiles=$$("#ctGrid .ct"),N=tiles.length;
  // phase A: claim types
  const pa=Math.min(1,t/.5)*(N-1),i=Math.floor(pa),frac=pa-i;
  tiles.forEach((el,k)=>el.classList.toggle("lit",k<=i+(frac>.85?1:0)));
  placeRoo(i,frac);
  const showBoard=t>=.56;
  $("#cTypes").classList.toggle("off",showBoard);$("#cBoard").classList.toggle("off",!showBoard);
  // phase B: claim board
  const tb=Math.max(0,(t-.58)/.42);
  const items=$$("#cbList .cb-item");
  const n=t<.58?0:Math.max(0,Math.min(items.length,Math.floor((tb-.02)/.15)+1));
  items.forEach((it,k)=>it.classList.toggle("on",k<n));
  const cnt=$("#cbCount");if(cnt.textContent!==String(n)){cnt.textContent=n;if(G&&motion&&n>0){G.fromTo("#cbRoo",{y:0},{y:-18,duration:.16,yoyo:true,repeat:1,ease:"power2.out"});G.fromTo(cnt,{scale:1.4},{scale:1,duration:.5,ease:"elastic.out(1,.4)"})}}
  const due=$("#cbDue"),done=n>=4;if(due.classList.contains("done")!==done){due.classList.toggle("done",done);due.textContent=done?"Done ✓":"Due in 3 days";if(G&&motion)G.fromTo(due,{scale:1.35},{scale:1,duration:.6,ease:"elastic.out(1,.4)"})}
  const st=$("#cbStatus"),label=n>=5?"Approved":n>=2?"In review":n>=1?"Filed":"Draft";if(st.textContent!==label){st.textContent=label;st.classList.toggle("ok",n>=5)}
  $("#cbPdf").classList.toggle("on",tb>=.86);
}
function staticRoo(){$("#rooStage").classList.add("static");rooState.t=1;$$("#ctGrid .ct").forEach(el=>el.classList.add("lit"));$("#cTypes").classList.remove("off");
  $("#cBoard").classList.remove("off");$$("#cbList .cb-item").forEach(it=>it.classList.add("on"));$("#cbCount").textContent=5;const d=$("#cbDue");d.classList.add("done");d.textContent="Done ✓";
  const st=$("#cbStatus");st.textContent="Approved";st.classList.add("ok");$("#cbPdf").classList.add("on")}

/* ---------- MOTION LAYER (GSAP) ---------- */
if(!motion){safe("static-lastly",()=>{lastlyState.t=0;renderLastly()});safe("static-roo",staticRoo);return}

const heroChars=[];
safe("hero-prep",()=>{
  $$("[data-split]").forEach(el=>heroChars.push(...splitChars(el)));
  heroChars.push(...splitChars($("#cycler")));
  G.set(heroChars,{yPercent:115});
  G.set(".h-rise",{y:28,opacity:0});
  G.set("#phF",{y:140,opacity:0,rotation:-8});G.set("#phL",{y:180,opacity:0,rotation:-20});G.set("#phS",{y:220,opacity:0,rotation:14});
  G.set(["#pf1","#pf2","#pf3"],{scale:.4,opacity:0});
});

function heroIntro(){
  const tl=G.timeline({defaults:{ease:"expo.out"}});
  tl.to(heroChars,{yPercent:0,duration:1.1,stagger:.028})
    .to(".h-rise",{y:0,opacity:1,duration:.9,stagger:.1},.35)
    .to("#phF",{y:0,opacity:1,rotation:0,duration:1.4,ease:"elastic.out(1,.7)"},.15)
    .to("#phL",{y:0,opacity:1,rotation:0,duration:1.4,ease:"elastic.out(1,.7)"},.25)
    .to("#phS",{y:0,opacity:1,rotation:0,duration:1.4,ease:"elastic.out(1,.7)"},.4)
    .to(["#pf1","#pf2","#pf3"],{scale:1,opacity:1,duration:.9,stagger:.15,ease:"back.out(2)"},.9);
  tl.add(startCycler,1.4);
}

/* loader */
safe("loader",()=>{
  const L=document.createElement("div");L.className="loader gut";L.setAttribute("aria-hidden","true");
  L.innerHTML=`<div class="top label"><span>Independent app studio</span><span>Canada</span></div><div><div class="count" id="lc">0</div><div class="wordbox"><span class="fitword" id="lw">DRAKIVERSE</span></div><div class="sig" id="lsig"><span class="ink">.studio<svg viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M4 30 C 70 8, 150 38, 220 18 S 290 10, 296 14"/></svg></span></div><div class="bar"><i id="lb"></i></div></div>`;
  document.body.appendChild(L);
  const lw=$("#lw",L);const chars=splitChars(lw);fitWord(lw);const refit=()=>{if(L.isConnected)fitWord(lw)};addEventListener("resize",refit);if(document.fonts){document.fonts.load(`700 100px ${getComputedStyle(lw).fontFamily}`).then(refit,refit);document.fonts.ready.then(refit)}[150,400,800].forEach(t=>setTimeout(refit,t));
  const c={v:0};const ls=$("#lsig",L);setTimeout(()=>ls.classList.add("on"),450);
  const tl=G.timeline({onComplete:()=>L.remove()});
  tl.from(chars,{yPercent:115,duration:.9,stagger:.045,ease:"expo.out"})
    .to(c,{v:100,duration:1.5,ease:"power2.inOut",onUpdate:()=>$("#lc",L).textContent=Math.round(c.v)},0)
    .to($("#lb",L),{scaleX:1,duration:1.5,ease:"power2.inOut"},0)
    .to(chars,{yPercent:-115,duration:.6,stagger:.025,ease:"expo.in"},1.65)
    .to(ls,{yPercent:-60,opacity:0,duration:.5,ease:"expo.in"},1.75)
    .to(L,{clipPath:"inset(0% 0% 100% 0%)",duration:.9,ease:"expo.inOut"},2.05)
    .add(heroIntro,2.25);
  L.style.clipPath="inset(0% 0% 0% 0%)";
  setTimeout(()=>{if(L.isConnected){L.remove();G.set([heroChars,".h-rise","#phF","#phL","#phS","#pf1","#pf2","#pf3"].flat(),{clearProps:"all"})}},7000);
});

/* cycling word */
const WORDS=["relief.","savings.","calm.","clarity."];let wi=0;
function startCycler(){
  const cyc=$("#cycler");
  const swap=()=>{const old=$$(".mask > span",cyc);
    G.to(old,{yPercent:-115,rotation:-6,duration:.4,stagger:.02,ease:"power3.in",onComplete:()=>{
      wi=(wi+1)%WORDS.length;cyc.textContent=WORDS[wi];const n=splitChars(cyc);
      G.fromTo(n,{yPercent:115,rotation:8},{yPercent:0,rotation:0,duration:.8,stagger:.03,ease:"expo.out"});G.delayedCall(2.4,swap)}})};
  G.delayedCall(2.2,swap);
}

/* hero: magnetic, tilt, scroll parallax */
safe("hero-motion",()=>{
  $$(".magnetic").forEach(b=>{const qx=G.quickTo(b,"x",{duration:.6,ease:"elastic.out(1,.4)"}),qy=G.quickTo(b,"y",{duration:.6,ease:"elastic.out(1,.4)"});
    b.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=b.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.3);qy((e.clientY-r.top-r.height/2)*.4)});
    b.addEventListener("pointerleave",()=>{qx(0);qy(0)})});
  const ph=$("#phones");G.set(ph,{transformPerspective:1000});
  const rx=G.quickTo(ph,"rotationX",{duration:.9,ease:"power3.out"}),ry=G.quickTo(ph,"rotationY",{duration:.9,ease:"power3.out"});
  const p1x=G.quickTo("#pf1","x",{duration:1.2,ease:"power3.out"}),p2x=G.quickTo("#pf2","x",{duration:1.2,ease:"power3.out"});
  $("#top").addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=e.currentTarget.getBoundingClientRect();const nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;rx(-ny*22);ry(nx*30);p1x(nx*50);p2x(-nx*60)});
  G.to("#pf1",{y:-12,duration:2,repeat:-1,yoyo:true,ease:"sine.inOut"});G.to("#pf3",{y:-10,duration:2.2,repeat:-1,yoyo:true,ease:"sine.inOut"});G.to("#pf2",{y:12,duration:2.4,repeat:-1,yoyo:true,ease:"sine.inOut"});
  const st={trigger:"#top",start:"top top",end:"bottom top",scrub:true};
  G.to("#heroCopy",{y:-140,opacity:0,ease:"none",scrollTrigger:st});
  const k=innerWidth<700?.35:1;
  G.to("#phL",{xPercent:-30*k,yPercent:-12,rotation:-14,ease:"none",scrollTrigger:st});
  G.to("#phS",{xPercent:24*k,yPercent:14,rotation:10,ease:"none",scrollTrigger:st});
  G.to("#phF",{yPercent:-22,rotation:-6,ease:"none",scrollTrigger:st});
});


/* hero: the three phones act out a little story on loop (milk countdown, Snip cut, Folderoo letter) */
safe("hero-live",()=>{
  const $t=id=>document.getElementById(id);
  const milkD=$t("lMilkD"),pf2t=$("#pf2 span"),tot=$t("sTotN"),gym=$t("sGym"),cut=$("#sGym .cutline"),fNew=$t("fNew"),fDays=$t("fDays"),roo=$t("fRoo");
  if(!milkD||!tot||!gym||!fNew||!fDays)return;
  fNew.style.display="flex";
  G.set(fNew,{height:0,paddingTop:0,paddingBottom:0,marginTop:-8,opacity:0,overflow:"hidden",borderWidth:0});
  const money={v:77.47},setTot=()=>tot.textContent="$"+money.v.toFixed(2);
  const pop=el=>G.timeline().to(el,{scale:1.1,duration:.18,ease:"power2.out"}).to(el,{scale:1,duration:.6,ease:"elastic.out(1,.45)"});
  const nudge=sel=>G.fromTo(sel,{scale:.97},{scale:1,duration:.8,ease:"elastic.out(1,.4)"});
  const say=(el,app,txt)=>{if(el)el.innerHTML=`<small>${app}</small>${txt}`};
  const tl=G.timeline({repeat:-1,repeatDelay:.6,paused:true});
  // 1. Lastly: milk ticks down
  tl.add(()=>{nudge("#phL .scr");pop(milkD);milkD.textContent="1 day";say(pf2t,"Lastly","Milk expires tomorrow");pop("#pf2")},.2)
    .to("#lMilk",{backgroundColor:"rgba(255,140,66,.28)",duration:.35,yoyo:true,repeat:1},.2)
  // 2. Snip: gym gets cut, total drops
    .to(gym,{outlineColor:"rgba(205,255,64,.9)",outlineWidth:2,outlineStyle:"solid",duration:.25},1.8)
    .to(cut,{scaleX:1,duration:.4,ease:"power3.inOut"},2.1)
    .to(gym,{x:26,opacity:.35,duration:.5,ease:"power2.in"},2.45)
    .to(money,{v:32.47,duration:.9,ease:"power2.out",onUpdate:setTot},2.45)
    .add(()=>{nudge("#phS .scr");pop("#sTot");pop("#pf1")},2.5)
  // 3. Folderoo: kangaroo hops, a letter is saved, deadline counts down
    .to(roo,{y:-7,duration:.22,ease:"power2.out",yoyo:true,repeat:3},3.7)
    .to(fNew,{height:"auto",paddingTop:10,paddingBottom:10,marginTop:0,opacity:1,borderWidth:1,duration:.6,ease:"back.out(1.6)"},3.9)
    .add(()=>{nudge("#phF .scr");fDays.textContent="4";pop("#fCard");say($("#pf3 span"),"Folderoo","Letter saved · form due in 4 days");pop("#pf3")},4.3)
  // reset quietly
    .add(()=>{},6.6)
    .to(fNew,{height:0,paddingTop:0,paddingBottom:0,marginTop:-8,opacity:0,borderWidth:0,duration:.5,ease:"power2.inOut"},6.6)
    .to(gym,{x:0,opacity:1,outlineWidth:0,duration:.5},6.6)
    .to(cut,{scaleX:0,duration:.3},6.6)
    .to(money,{v:77.47,duration:.6,onUpdate:setTot},6.6)
    .add(()=>{milkD.textContent="2 days";fDays.textContent="5";say(pf2t,"Lastly","Milk expires in 2 days");say($("#pf3 span"),"Folderoo","Claim form due in 5 days")},6.9);
  // gentle idle float, each phone on its own beat
  [["#phL",-8,3.2],["#phS",7,2.8],["#phF",-9,3.6]].forEach(([el,y,d],i)=>G.to(el,{y,duration:d,yoyo:true,repeat:-1,ease:"sine.inOut",delay:4.6+i*.4}));
  G.delayedCall(4.8,()=>{tl.play();ST.create({trigger:"#top",start:"top bottom",end:"bottom top",onToggle:self=>self.isActive?tl.resume():tl.pause()})});
});


/* Snip: a monthly receipt gets the forgotten subscriptions snipped off, on loop while in view */
safe("snip-receipt",()=>{
  const show=$("#snipShow"),tail=$("#rcTail"),sc=$("#rcSc"),cut=$("#rcpt .rc-cut"),saved=$("#rcSaved"),num=$("#rcSave");
  if(!show||!tail||!sc||!cut)return;
  const forgot=$$(".rc-line.forgot",tail),v={n:0},fmt=()=>num.textContent="$"+v.n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const dist=()=>cut.getBoundingClientRect().width;
  const tl=G.timeline({repeat:-1,repeatDelay:.4,paused:true,onRepeat:()=>{}});
  tl.set(tail,{y:0,rotation:0,opacity:1}).set(saved,{scale:.4,opacity:0}).set(sc,{x:0}).add(()=>{v.n=0;fmt()})
    .fromTo("#rcpt",{clipPath:"inset(0% -60px 100% -60px)"},{clipPath:"inset(-40px -60px -400px -60px)",duration:.8,ease:"power2.out"},0)
    .to(forgot,{backgroundColor:"rgba(255,140,66,.22)",duration:.25,yoyo:true,repeat:3,stagger:.1},.7)
    .to(sc,{x:()=>dist()-4,duration:1.5,ease:"power1.inOut"},1.6)
    .to("#rcBa",{rotation:16,svgOrigin:"12 12",duration:.1,yoyo:true,repeat:13,ease:"power1.inOut"},1.6)
    .to("#rcBb",{rotation:-16,svgOrigin:"12 12",duration:.1,yoyo:true,repeat:13,ease:"power1.inOut"},1.6)
    .to(tail,{y:150,rotation:9,opacity:0,duration:.9,ease:"power2.in"},3.15)
    .to(".snip-logo .sh-r",{x:7,y:-5,rotation:8,svgOrigin:"60 50",duration:.25,ease:"power2.out",yoyo:true,repeat:1,repeatDelay:.5},3.1)
    .to(saved,{scale:1,opacity:1,duration:.7,ease:"back.out(2.2)"},3.5)
    .to(v,{n:1379.88,duration:1.2,ease:"power2.out",onUpdate:fmt},3.5)
    .to(sc,{x:0,duration:.6,ease:"power2.inOut"},6.4)
    .to(saved,{scale:.6,opacity:0,duration:.4},6.6)
    .to(tail,{y:0,rotation:0,opacity:1,duration:.5,ease:"power2.out"},6.7);
  new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?tl.play():tl.pause()),{threshold:.25}).observe(show);
});

/* nav, progress */
safe("nav",()=>{
  G.to("#progress",{scaleX:1,ease:"none",scrollTrigger:{start:0,end:"max",scrub:.3}});
  const nav=$("#nav");ST.create({start:0,end:"max",onUpdate:s=>{if(!$("#detail").hidden)return;nav.classList.toggle("hide",s.direction===1&&s.scroll()>240)}});
});

/* velocity marquee */
safe("marquee",()=>{
  const t1=G.to("#m1",{xPercent:-50,duration:26,ease:"none",repeat:-1});
  const t2=G.fromTo("#m2",{xPercent:-50},{xPercent:0,duration:30,ease:"none",repeat:-1});
  const skew=G.quickTo(".mrow","skewX",{duration:.5,ease:"power3.out"});
  ST.create({start:0,end:"max",onUpdate:s=>{const v=s.getVelocity();const ts=1+Math.min(Math.abs(v)/250,8);
    G.to([t1,t2],{timeScale:ts,duration:.15,overwrite:true,onComplete:()=>G.to([t1,t2],{timeScale:1,duration:1.2,ease:"power2.out"})});
    skew(G.utils.clamp(-12,12,-v/180))}});
});

/* pinned horizontal worlds */
safe("worlds",()=>{
  const track=$("#track");const dist=()=>Math.max(0,track.scrollWidth-document.documentElement.clientWidth);
  const hz=G.to(track,{x:()=>-dist(),ease:"none",scrollTrigger:{trigger:"#worlds",start:"top top",end:()=>"+="+dist(),pin:true,scrub:.8,invalidateOnRefresh:true,anticipatePin:1,
    onUpdate:s=>G.set("#wbar",{scaleX:s.progress})}});
  $$(".world",track).forEach(card=>{
    G.fromTo($(".art",card),{xPercent:22,rotation:8},{xPercent:-22,rotation:-8,ease:"none",scrollTrigger:{trigger:card,containerAnimation:hz,start:"left right",end:"right left",scrub:true}});
    G.from($(".wname",card),{yPercent:60,opacity:0,ease:"power2.out",scrollTrigger:{trigger:card,containerAnimation:hz,start:"left 85%",end:"left 45%",scrub:true}});
  });
  G.timeline({repeat:-1,repeatDelay:1.2}).to(".world.snip .half-l",{x:-6,y:3,rotation:-6,transformOrigin:"30% 50%",duration:.5,ease:"back.out(2)"})
    .to(".world.snip .half-r",{x:6,y:-3,rotation:6,transformOrigin:"70% 50%",duration:.5,ease:"back.out(2)"},"<").to(".world.snip .half-l,.world.snip .half-r",{x:0,y:0,rotation:0,duration:.6,ease:"power3.inOut",delay:.8});
  $$(".world.lastly .st").forEach(p=>{const L=p.getTotalLength();G.set(p,{strokeDasharray:L})});
  G.timeline({repeat:-1,repeatDelay:1.4}).fromTo(".world.lastly .st",{strokeDashoffset:(i,t)=>t.getTotalLength()},{strokeDashoffset:0,duration:.9,stagger:.18,ease:"power3.inOut"}).to({},{duration:1.2});
  G.to(".qm",{rotation:12,scale:1.1,duration:1.6,repeat:-1,yoyo:true,ease:"sine.inOut"});
});

/* Lastly time-lapse (pinned, scroll = time) */
safe("lastly",()=>{
  $$(".ls").forEach(p=>{const L=p.getTotalLength();G.set(p,{strokeDasharray:L,strokeDashoffset:L})});
  const tl=G.timeline({scrollTrigger:{trigger:"#lastly",start:"top top",end:"+=240%",pin:true,scrub:.6,anticipatePin:1}});
  tl.to(".ls",{strokeDashoffset:0,stagger:.04,duration:.15,ease:"power2.out"},0)
    .to(lastlyState,{t:214,duration:1,ease:"none",onUpdate:renderLastly},0)
    .to("#lastly",{"--sbg":"#fff1dc","--sfg":"#0b0b0c","--smuted":"#5b544b",duration:.18,ease:"power1.inOut"},.42);
  renderLastly();
});

/* Folderoo claim board (pinned, scroll fills the pouch) */
safe("folderoo",()=>{
  G.timeline({scrollTrigger:{trigger:"#folderoo",start:"top top",end:"+=320%",pin:true,scrub:.6,anticipatePin:1}})
    .to(rooState,{t:1,duration:1,ease:"none",onUpdate:renderRoo},0);
  renderRoo();addEventListener("resize",renderRoo);
});

/* manifesto + cards */
safe("manifesto",()=>{
  const m=$("#manifesto");m.setAttribute("aria-label",m.textContent.replace(/\s+/g," ").trim());
  const walk=n=>[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t||/^\s+$/.test(t))return;const s=document.createElement("span");s.textContent=t;s.setAttribute("aria-hidden","true");f.appendChild(s)});c.replaceWith(f)}else if(c.nodeType===1){c.setAttribute("aria-hidden","true")}});
  walk(m);
  G.fromTo($$("span",m),{opacity:.16,y:10},{opacity:1,y:0,stagger:.08,ease:"none",scrollTrigger:{trigger:m,start:"top 82%",end:"bottom 45%",scrub:true}});
  G.from(".pcard",{y:80,opacity:0,rotation:3,duration:1,stagger:.1,ease:"expo.out",scrollTrigger:{trigger:"#pgrid",start:"top 85%"}});
});

/* contact letters + footer word */
safe("contact",()=>{
  G.from(bigLetters,{yPercent:120,rotation:()=>G.utils.random(-25,25),opacity:0,duration:1.5,stagger:.05,ease:"elastic.out(1,.5)",scrollTrigger:{trigger:"#big",start:"top 85%"}});
  bigLetters.forEach((s,i)=>{s.addEventListener("pointerenter",()=>G.to(s,{y:-24,rotation:i%2?10:-10,duration:.6,ease:"elastic.out(1,.3)"}));s.addEventListener("pointerleave",()=>G.to(s,{y:0,rotation:0,duration:.9,ease:"elastic.out(1,.3)"}))});
  G.from(footLetters,{yPercent:100,opacity:0,duration:1.1,stagger:.05,ease:"expo.out",scrollTrigger:{trigger:"#footword",start:"top 95%"}});
});
safe("appicons",()=>{G.from(".appicon",{y:24,opacity:0,duration:.8,stagger:.08,ease:"back.out(1.6)",scrollTrigger:{trigger:".appicons",start:"top 92%"}})});
safe("footer",()=>{
  G.from(".fin",{y:50,opacity:0,duration:1,stagger:.08,ease:"expo.out",scrollTrigger:{trigger:".fgrid",start:"top 88%"}});
  G.from(".fcol li",{x:-16,opacity:0,duration:.6,stagger:.04,ease:"power3.out",scrollTrigger:{trigger:".fgrid",start:"top 85%"}});
  G.to("#toRing",{rotation:360,duration:14,repeat:-1,ease:"none",transformOrigin:"50% 50%"});
  const tt=$("#totop"),qx=G.quickTo(tt,"x",{duration:.6,ease:"elastic.out(1,.4)"}),qy=G.quickTo(tt,"y",{duration:.6,ease:"elastic.out(1,.4)"});
  tt.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=tt.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.35);qy((e.clientY-r.top-r.height/2)*.35)});
  tt.addEventListener("pointerleave",()=>{qx(0);qy(0)});
  tt.addEventListener("click",e=>{e.preventDefault();G.to("#toRing",{rotation:"+=360",duration:.9,ease:"expo.inOut"});scrollTo({top:0,behavior:"smooth"})});
});

addEventListener("load",()=>ST.refresh());
})();
