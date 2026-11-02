/* Renvo page: the scan demo video starts muted (browsers block autoplay with sound); this button turns the sound on and off. */
(function(){
  "use strict";
  var v=document.querySelector("#scan-demo video"),b=document.getElementById("demoSound");
  if(!v||!b)return;
  function show(){var on=!v.muted;b.setAttribute("aria-pressed",on?"true":"false");b.querySelector("span").textContent=on?"Sound on":"Tap for sound";b.classList.toggle("on",on)}
  b.addEventListener("click",function(){v.muted=!v.muted;if(!v.muted){v.currentTime=0;var p=v.play();if(p&&p.catch)p.catch(function(){})}show()});
  show();
})();
