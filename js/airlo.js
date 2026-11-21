/* Airlo: play instruments in the air with your hands.
   The camera picture never leaves this device: hand tracking runs here, in the browser, with MediaPipe files
   served from this site (/js/mediapipe). Sound is made live with the Web Audio API. Nothing is uploaded, stored or tracked.
   A recording is only made when you tap Record, and it goes straight to your own Downloads. */

const $ = s => document.querySelector(s);
const cv = $("#stage"), ctx = cv.getContext("2d"), video = $("#cam");
const TEST = location.hash === "#test";
const MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Snapchat|TikTok|musical_ly|BytedanceWebview|Line\/|LinkedInApp|Twitter|Pinterest|GSA\//i.test(navigator.userAgent);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteName = m => NOTE[m % 12] + (Math.floor(m / 12) - 1);
const COLORS = ["#5EC8FF", "#E040FB", "#9BE38B", "#FFB74D", "#FF6F61", "#B39DFF"];

/* ---------- screen ---------- */
let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (inst && inst.layout) inst.layout();
}
addEventListener("resize", resize);

/* the camera picture fills the screen, mirrored like a mirror */
function cover() {
  const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
  const s = Math.max(W / vw, H / vh), dw = vw * s, dh = vh * s;
  return {ox: (W - dw) / 2, oy: (H - dh) / 2, dw, dh};
}

/* ---------- sound ---------- */
let AC = null, master = null, recDest = null, noise = null;
const ksCache = new Map();
function initAudio() {
  if (AC) { AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)({latencyHint: "interactive"});
  master = AC.createGain(); master.gain.value = 0.8;
  const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  const rev = AC.createConvolver(), wet = AC.createGain();
  const n = Math.floor(AC.sampleRate * 2.2), ir = AC.createBuffer(2, n, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
  rev.buffer = ir; wet.gain.value = 0.22;
  master.connect(comp); master.connect(rev); rev.connect(wet); wet.connect(comp);
  comp.connect(AC.destination);
  if (AC.createMediaStreamDestination) { recDest = AC.createMediaStreamDestination(); comp.connect(recDest); }
  noise = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
  const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
}
function out(gain, pan) {
  const g = AC.createGain(); g.gain.value = gain;
  if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = clamp(pan || 0, -1, 1); g.connect(p); p.connect(master); }
  else g.connect(master);
  return g;
}
/* plucked string (Karplus-Strong), made once per pitch and reused */
function ksBuffer(f, decay, bright) {
  const key = f.toFixed(2) + "|" + decay + "|" + bright;
  if (ksCache.has(key)) return ksCache.get(key);
  const sr = AC.sampleRate, n = Math.floor(sr * 2.6), N = Math.max(2, Math.round(sr / f));
  const b = AC.createBuffer(1, n, sr), d = b.getChannelData(0), ring = new Float32Array(N);
  let prev = 0;
  for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; prev = prev + (r - prev) * bright; ring[i] = prev; }
  let idx = 0, peak = 1e-6;
  for (let i = 0; i < n; i++) {
    const a = ring[idx], nx = ring[(idx + 1) % N];
    d[i] = a; ring[idx] = decay * 0.5 * (a + nx); idx = (idx + 1) % N;
    if (Math.abs(a) > peak) peak = Math.abs(a);
  }
  const fade = Math.floor(n * 0.06);
  for (let i = 0; i < n; i++) { d[i] /= peak; if (i > n - fade) d[i] *= (n - i) / fade; }
  ksCache.set(key, b); return b;
}
function pluck(midi, vel, pan, decay = 0.997, bright = 0.6) {
  if (!AC) return;
  const s = AC.createBufferSource(); s.buffer = ksBuffer(mtof(midi), decay, bright);
  s.connect(out(0.55 * vel, pan)); s.start();
}
function pianoNote(midi, vel, pan) {
  if (!AC) return;
  const f = mtof(midi), t = AC.currentTime, o = out(0.32 * vel, pan);
  [[1, 1, "triangle"], [2, 0.42, "sine"], [3, 0.2, "sine"], [4.02, 0.08, "sine"]].forEach(([k, a, type], i) => {
    const osc = AC.createOscillator(), g = AC.createGain();
    osc.type = type; osc.frequency.value = f * k; osc.detune.value = (i % 2 ? 3 : -3);
    const len = 2.6 / (1 + i * 0.6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    osc.connect(g); g.connect(o); osc.start(t); osc.stop(t + len + 0.05);
  });
}
function noiseHit(filterType, freq, len, gain, pan) {
  const t = AC.currentTime, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noise; f.type = filterType; f.frequency.value = freq;
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f); f.connect(g); g.connect(out(1, pan)); s.start(t); s.stop(t + len + 0.05);
}
function toneDrop(f0, f1, len, gain, pan, type = "sine") {
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len * 0.6);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(g); g.connect(out(1, pan)); o.start(t); o.stop(t + len + 0.05);
}
const DRUM = {
  kick: (v, p) => toneDrop(150, 42, 0.5, 1.0 * v, p),
  snare: (v, p) => { noiseHit("highpass", 1300, 0.22, 0.6 * v, p); toneDrop(220, 160, 0.12, 0.35 * v, p, "triangle"); },
  hat: (v, p) => noiseHit("highpass", 7500, 0.06, 0.35 * v, p),
  tom: (v, p) => toneDrop(230, 110, 0.38, 0.75 * v, p),
  crash: (v, p) => noiseHit("highpass", 4200, 1.3, 0.32 * v, p)
};

/* ---------- hands ---------- */
let hands = [], nextId = 1, lastResultT = 0;
function fingersUp(h) {
  const p = h.p; let n = 0;
  [[8, 6], [12, 10], [16, 14], [20, 18]].forEach(([tip, pip]) => { if (dist(p[tip], p[0]) > dist(p[pip], p[0]) * 1.12) n++; });
  return n;
}
function updateHands(raw) {
  const now = performance.now(), dt = clamp((now - lastResultT) / 1000, 0.016, 0.25); lastResultT = now;
  const {ox, oy, dw, dh} = cover();
  const fresh = raw.map(lm => ({p: lm.map(q => ({x: ox + (1 - q.x) * dw, y: oy + q.y * dh}))}));
  const used = new Set();
  fresh.forEach(h => {
    let best = null, bd = Math.max(W, H) * 0.5;
    hands.forEach(o => { if (used.has(o.id)) return; const d = dist(o.p[0], h.p[0]); if (d < bd) { bd = d; best = o; } });
    if (best) {
      used.add(best.id); h.id = best.id; h.prev = best.p; h.pinch = best.pinch; h.color = best.color;
      h.p = h.p.map((q, i) => ({x: best.p[i].x + (q.x - best.p[i].x) * 0.7, y: best.p[i].y + (q.y - best.p[i].y) * 0.7}));
    } else { h.id = nextId++; h.prev = h.p; h.pinch = false; h.color = COLORS[h.id % COLORS.length]; }
    h.palm = dist(h.p[0], h.p[9]) || 1;
    const pr = dist(h.p[4], h.p[8]) / h.palm;
    h.pinch = h.pinch ? pr < 0.5 : pr < 0.33;
    h.pinchPt = {x: (h.p[4].x + h.p[8].x) / 2, y: (h.p[4].y + h.p[8].y) / 2};
    h.v = i => ({x: (h.p[i].x - h.prev[i].x) / dt, y: (h.p[i].y - h.prev[i].y) / dt});
    h.c = h.p[9];
  });
  const before = hands; hands = fresh;
  if (inst) inst.update(hands, before, dt);
}

/* ---------- effects ---------- */
const sparks = [];
function burst(x, y, color, n = 14) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 40 + Math.random() * 220; sparks.push({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 1, color}); }
  if (sparks.length > 400) sparks.splice(0, sparks.length - 400);
}
function drawSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]; s.life -= dt * 1.6; if (s.life <= 0) { sparks.splice(i, 1); continue; }
    s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 160 * dt;
    ctx.globalAlpha = s.life; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, 1.6 + s.life * 2, 0, 6.3); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function glowLine(pts, color, width, alpha = 1) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  [[width * 5, 0.12], [width * 2.4, 0.3], [width, 1]].forEach(([w, a]) => {
    ctx.globalAlpha = a * alpha; ctx.strokeStyle = a === 1 ? "#fff" : color; ctx.lineWidth = w;
    ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
  });
  ctx.globalAlpha = 1;
}
const LINKS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
function drawHands() {
  hands.forEach(h => {
    ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    LINKS.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(h.p[a].x, h.p[a].y); ctx.lineTo(h.p[b].x, h.p[b].y); ctx.stroke(); });
    ctx.fillStyle = h.color; h.p.forEach(q => { ctx.beginPath(); ctx.arc(q.x, q.y, 3.2, 0, 6.3); ctx.fill(); });
    if (h.pinch && inst && inst.showPinch) { ctx.strokeStyle = h.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(h.pinchPt.x, h.pinchPt.y, 14, 0, 6.3); ctx.stroke(); }
  });
}
function label(text, x, y, size = 14, color = "rgba(255,255,255,.9)", align = "center") {
  ctx.font = `700 ${size}px Manrope, system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = "middle";
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}

/* ---------- instruments ---------- */
const PENTA = [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81];

const harp = {
  name: "Harp", showPinch: true,
  hint: "Pinch with both hands and pull apart to draw a string (or pinch and drag with one hand). Swipe a finger through a string to play it.",
  strings: [], draft: null, starts: {},
  reset() { this.strings = []; this.draft = null; this.starts = {}; },
  add(a, b) {
    const len = dist(a, b); if (len < 60) return;
    const k = clamp(Math.round((1 - clamp(len / (Math.hypot(W, H) * 0.75), 0, 1)) * (PENTA.length - 1)), 0, PENTA.length - 1);
    this.strings.push({a, b, midi: PENTA[k], amp: 0, t: 0, last: 0, color: COLORS[this.strings.length % COLORS.length]});
    if (this.strings.length > 14) this.strings.shift();
    burst((a.x + b.x) / 2, (a.y + b.y) / 2, "#fff", 10);
  },
  update(hs) {
    const pinching = hs.filter(h => h.pinch);
    hs.forEach(h => { if (h.pinch && !this.starts[h.id]) this.starts[h.id] = h.pinchPt; });
    if (pinching.length >= 2) this.draft = {a: pinching[0].pinchPt, b: pinching[1].pinchPt, two: true};
    else if (pinching.length === 1) { const h = pinching[0]; this.draft = {a: this.starts[h.id], b: h.pinchPt, two: false}; }
    else if (this.draft) { this.add(this.draft.a, this.draft.b); this.draft = null; }
    if (this.draft && this.draft.two && pinching.length < 2) { this.add(this.draft.a, this.draft.b); this.draft = null; }
    Object.keys(this.starts).forEach(id => { const h = hs.find(x => String(x.id) === id); if (!h || !h.pinch) delete this.starts[id]; });
    const now = performance.now();
    hs.forEach(h => {
      if (h.pinch) return;
      [8, 12].forEach(i => {
        const p = h.p[i], q = h.prev[i];
        this.strings.forEach(s => {
          const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, L2 = dx * dx + dy * dy;
          const side = (x, y) => Math.sign(dx * (y - s.a.y) - dy * (x - s.a.x));
          if (side(p.x, p.y) === side(q.x, q.y) || now - s.last < 90) return;
          const t = ((p.x - s.a.x) * dx + (p.y - s.a.y) * dy) / L2;
          if (t < 0.02 || t > 0.98 || dist(p, q) > 260) return;
          const sp = Math.hypot(h.v(i).x, h.v(i).y), vel = clamp(sp / 1400, 0.35, 1);
          s.last = now; s.amp = 10 + vel * 14; s.t = 0;
          pluck(s.midi, vel, (s.a.x + s.b.x) / W - 1, 0.9985, 0.72);
          burst(s.a.x + dx * t, s.a.y + dy * t, s.color);
        });
      });
    });
  },
  draw(dt) {
    this.strings.forEach(s => {
      s.t += dt; const amp = s.amp * Math.exp(-s.t * 2.6);
      const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, pts = [];
      for (let i = 0; i <= 24; i++) { const u = i / 24, o = amp * Math.sin(Math.PI * u) * Math.sin(s.t * 60); pts.push({x: s.a.x + dx * u + nx * o, y: s.a.y + dy * u + ny * o}); }
      glowLine(pts, s.color, 2.2, 0.55 + clamp(amp / 20, 0, 0.45));
      [s.a, s.b].forEach(e => { ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(e.x, e.y, 4, 0, 6.3); ctx.fill(); });
    });
    if (this.draft && this.draft.a) {
      ctx.setLineDash([6, 8]); ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(this.draft.a.x, this.draft.a.y); ctx.lineTo(this.draft.b.x, this.draft.b.y); ctx.stroke(); ctx.setLineDash([]);
    }
  }
};

const CHORDS = [
  ["Em", [40, 47, 52, 55, 59, 64]],
  ["C", [null, 48, 52, 55, 60, 64]],
  ["G", [43, 47, 50, 55, 59, 67]],
  ["Am", [null, 45, 52, 57, 60, 64]],
  ["F", [41, 48, 53, 57, 60, 65]]
];
const guitar = {
  name: "Guitar",
  hint: "Left hand: hold up 1, 2, 3 or 4 fingers to pick a chord (a fist plays Em). Right hand: strum up or down through the strings.",
  chord: 0, glow: [0, 0, 0, 0, 0, 0], last: [0, 0, 0, 0, 0, 0],
  reset() { this.chord = 0; },
  ys() { const top = H * 0.34, bot = H * 0.74; return [0, 1, 2, 3, 4, 5].map(i => top + (bot - top) * i / 5); },
  x0() { return W * 0.46; },
  update(hs) {
    const left = hs.filter(h => h.c.x < this.x0()), right = hs.filter(h => h.c.x >= this.x0());
    if (left.length) this.chord = clamp(fingersUp(left[0]), 0, 4);
    const ys = this.ys(), now = performance.now(), notes = CHORDS[this.chord][1];
    right.forEach(h => [8, 12].forEach(i => {
      const p = h.p[i], q = h.prev[i];
      if (p.x < this.x0() - 30) return;
      ys.forEach((y, k) => {
        if ((q.y - y) * (p.y - y) >= 0 || now - this.last[k] < 70 || notes[k] == null || Math.abs(p.y - q.y) > 400) return;
        const vel = clamp(Math.abs(h.v(i).y) / 1600, 0.35, 1);
        this.last[k] = now; this.glow[k] = 1;
        pluck(notes[k], vel, 0.35, 0.996, 0.45);
      });
    }));
  },
  draw(dt) {
    const ys = this.ys(), x0 = this.x0();
    ys.forEach((y, k) => {
      this.glow[k] = Math.max(0, this.glow[k] - dt * 2.5);
      const g = this.glow[k], pts = [];
      for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push({x: x0 + (W * 0.98 - x0) * u, y: y + g * 6 * Math.sin(Math.PI * u) * Math.sin(performance.now() / 18)}); }
      glowLine(pts, "#FFB74D", 1.2 + (5 - k) * 0.35, 0.45 + g * 0.55);
    });
    const r = Math.min(W, H) * 0.09;
    ctx.globalAlpha = 0.85; ctx.fillStyle = "rgba(20,20,26,.75)"; ctx.beginPath(); ctx.arc(W * 0.2, H * 0.22, r, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
    label(CHORDS[this.chord][0], W * 0.2, H * 0.22, Math.round(r * 0.75), "#FFB74D");
    label(["fist", "1 finger", "2 fingers", "3 fingers", "4 fingers"][this.chord], W * 0.2, H * 0.22 + r + 14, 12, "rgba(255,255,255,.7)");
  }
};

const piano = {
  name: "Piano",
  hint: "Tap the keys with your fingertips, like pressing down on a real piano. Use several fingers for chords.",
  keys: [], press: {},
  reset() { this.layout(); },
  layout() {
    const notes = W < 700 ? [60, 62, 64, 65, 67, 69, 71, 72, 74, 76] : [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];
    const top = H * 0.62, bot = H * 0.86, w = (W * 0.94) / notes.length, x0 = W * 0.03;
    this.keys = notes.map((m, i) => ({m, x: x0 + i * w, y: top, w: w - 4, h: bot - top, glow: 0}));
  },
  update(hs) {
    hs.forEach(h => [4, 8, 12, 16, 20].forEach(i => {
      const p = h.p[i], q = h.prev[i], key = h.id + ":" + i, vy = h.v(i).y;
      const k = this.keys.find(k => p.x >= k.x && p.x <= k.x + k.w && p.y >= k.y && p.y <= k.y + k.h);
      const wasIn = this.keys.find(k => q.x >= k.x && q.x <= k.x + k.w && q.y >= k.y && q.y <= k.y + k.h);
      if (k && k !== wasIn && vy > 120 && this.press[key] !== k.m) {
        this.press[key] = k.m; k.glow = 1;
        pianoNote(k.m, clamp(vy / 1300, 0.35, 1), (k.x / W) * 2 - 1);
        burst(p.x, k.y, "#5EC8FF", 6);
      }
      if (!k) delete this.press[key];
    }));
  },
  draw(dt) {
    this.keys.forEach(k => {
      k.glow = Math.max(0, k.glow - dt * 3);
      ctx.fillStyle = `rgba(${245 - k.glow * 150},${245 - k.glow * 40},255,${0.55 + k.glow * 0.4})`;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(k.x, k.y, k.w, k.h, 8) : ctx.rect(k.x, k.y, k.w, k.h); ctx.fill();
      label(noteName(k.m).replace(/\d/, ""), k.x + k.w / 2, k.y + k.h - 16, 12, "rgba(8,19,27,.75)");
    });
  }
};

const drums = {
  name: "Drums",
  hint: "Hit the pads with quick downward moves. The faster you hit, the louder it plays.",
  pads: [], cool: {},
  reset() { this.layout(); },
  layout() {
    const r = Math.min(W, H) * (W < 700 ? 0.12 : 0.1);
    this.pads = [
      {n: "crash", label: "Crash", x: W * 0.16, y: H * 0.3, r: r * 0.9, c: "#FFB74D"},
      {n: "hat", label: "Hi-hat", x: W * 0.2, y: H * 0.62, r, c: "#9BE38B"},
      {n: "snare", label: "Snare", x: W * 0.4, y: H * 0.74, r, c: "#5EC8FF"},
      {n: "kick", label: "Kick", x: W * 0.6, y: H * 0.8, r: r * 1.15, c: "#FF6F61"},
      {n: "tom", label: "Tom", x: W * 0.8, y: H * 0.62, r, c: "#E040FB"},
      {n: "crash", label: "Crash", x: W * 0.84, y: H * 0.3, r: r * 0.9, c: "#FFB74D"}
    ].map(p => ({...p, glow: 0}));
  },
  update(hs) {
    const now = performance.now();
    hs.forEach(h => [8, 12, 9].forEach(i => {
      const p = h.p[i], q = h.prev[i], v = h.v(i), sp = Math.hypot(v.x, v.y);
      this.pads.forEach((pad, j) => {
        const inNow = dist(p, pad) < pad.r, inBefore = dist(q, pad) < pad.r, key = h.id + ":" + j;
        if (inNow && !inBefore && sp > 260 && !(now - (this.cool[key] || 0) < 160)) {
          this.cool[key] = now;
          pad.glow = 1; DRUM[pad.n](clamp(sp / 1800, 0.35, 1), (pad.x / W) * 2 - 1);
          burst(p.x, p.y, pad.c, 12);
        }
      });
    }));
  },
  draw(dt) {
    this.pads.forEach(p => {
      p.glow = Math.max(0, p.glow - dt * 3.5);
      ctx.globalAlpha = 0.25 + p.glow * 0.5; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + p.glow * 0.08), 0, 6.3); ctx.fill();
      ctx.globalAlpha = 0.9; ctx.strokeStyle = p.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.stroke();
      ctx.globalAlpha = 1; label(p.label, p.x, p.y, 13);
    });
  }
};

const CELLO = [36, 38, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60];
const cello = {
  name: "Cello",
  hint: "Left hand: move it up or down to pick the note. Right hand: move it side to side to bow. Faster bowing plays louder.",
  voice: null, note: 48, level: 0, bowX: null,
  reset() { this.stop(); this.note = 48; this.level = 0; },
  start() {
    if (!AC || this.voice) return;
    const g = AC.createGain(), lp = AC.createBiquadFilter(), lfo = AC.createOscillator(), lg = AC.createGain();
    g.gain.value = 0; lp.type = "lowpass"; lp.frequency.value = 1300; lp.Q.value = 0.8;
    lfo.frequency.value = 5.2; lg.gain.value = 0;
    const oscs = [-5, 5].map(det => { const o = AC.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(this.note); o.detune.value = det; lg.connect(o.frequency); o.connect(lp); o.start(); return o; });
    const body = AC.createBiquadFilter(); body.type = "peaking"; body.frequency.value = 280; body.gain.value = 6;
    lp.connect(body); body.connect(g); g.connect(master); lfo.connect(lg); lfo.start();
    this.voice = {g, oscs, lfo, lg};
  },
  stop() { if (!this.voice) return; const v = this.voice; this.voice = null; try { v.g.gain.setTargetAtTime(0, AC.currentTime, 0.05); setTimeout(() => { v.oscs.forEach(o => o.stop()); v.lfo.stop(); }, 400); } catch (e) {} },
  update(hs, before, dt) {
    this.start(); if (!this.voice) return;
    const left = hs.filter(h => h.c.x < W / 2), right = hs.filter(h => h.c.x >= W / 2);
    if (left.length) {
      const u = clamp((left[0].c.y - H * 0.15) / (H * 0.7), 0, 1);
      this.note = CELLO[Math.round((1 - u) * (CELLO.length - 1))];
    }
    let speed = 0;
    if (right.length) { const v = right[0].v(9); speed = Math.abs(v.x) + Math.abs(v.y) * 0.3; this.bowX = right[0].c; } else this.bowX = null;
    this.level += (clamp(speed / 900, 0, 1) - this.level) * 0.5;
    const t = AC.currentTime, f = mtof(this.note);
    this.voice.oscs.forEach(o => o.frequency.setTargetAtTime(f, t, 0.03));
    this.voice.lg.gain.setTargetAtTime(f * 0.006 * this.level, t, 0.1);
    this.voice.g.gain.setTargetAtTime(0.32 * this.level, t, 0.06);
  },
  draw() {
    const x0 = W * 0.08, x1 = W * 0.42;
    [0, 1, 2, 3].forEach(i => { const x = x0 + (x1 - x0) * (i + 0.5) / 4; glowLine([{x, y: H * 0.12}, {x, y: H * 0.88}], "#B39DFF", 1.4 + (3 - i) * 0.4, 0.4 + this.level * 0.6); });
    const u = 1 - CELLO.indexOf(this.note) / (CELLO.length - 1), y = H * 0.15 + u * H * 0.7;
    ctx.fillStyle = "rgba(179,157,255,.25)"; ctx.fillRect(x0, y - 16, x1 - x0, 32);
    label(noteName(this.note), (x0 + x1) / 2, y, 16, "#fff");
    if (this.bowX) { const b = this.bowX; glowLine([{x: b.x - W * 0.16, y: b.y + 30}, {x: b.x + W * 0.16, y: b.y - 30}], "#FFB74D", 2, 0.5 + this.level * 0.5); }
  }
};

const INSTRUMENTS = {harp, guitar, piano, drums, cello};
let inst = null;
function select(name) {
  if (inst && inst.stop) inst.stop();
  inst = INSTRUMENTS[name] || harp;
  if (inst.layout) inst.layout();
  if (inst.reset) inst.reset();
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.i === name ? "true" : "false"));
  $("#hint").textContent = inst.hint;
  $("#clear").hidden = inst !== harp;
  try { localStorage.setItem("airlo-inst", name); } catch (e) {}
}

/* ---------- drawing loop ---------- */
let lastFrame = performance.now(), camReady = false;
function frame(now) {
  const dt = clamp((now - lastFrame) / 1000, 0, 0.05); lastFrame = now;
  ctx.globalAlpha = 1;
  if (camReady && video.readyState >= 2) {
    const {ox, oy, dw, dh} = cover();
    ctx.save(); ctx.translate(ox + dw, oy); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0, dw, dh); ctx.restore();
    ctx.fillStyle = "rgba(8,8,12,.45)"; ctx.fillRect(0, 0, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0F1F2C"); g.addColorStop(1, "#0B0B0D");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (inst) inst.draw(dt);
  drawHands(); drawSparks(dt);
  label("airlo · drakiverse.studio", W - 12, H - 12, 11, "rgba(255,255,255,.55)", "right");
  requestAnimationFrame(frame);
}

/* ---------- camera + tracking ---------- */
const wait = ms => new Promise(r => setTimeout(r, ms));
function status(t) { $("#status").textContent = t || ""; }
async function startTracking() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status(IN_APP ? "This app's browser can't use the camera. Open drakiverse.studio/airlo in Chrome or Safari." : "This browser can't use the camera."); return false; }
  status("Asking for the camera…");
  let stream;
  const tries = [{facingMode: "user", width: {ideal: 640}, height: {ideal: 480}, frameRate: {ideal: 30}}, {facingMode: "user"}, true];
  for (const v of tries) { try { stream = await navigator.mediaDevices.getUserMedia({video: v, audio: false}); break; } catch (e) { if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) break; } }
  if (!stream) { status(IN_APP ? "This app's browser blocked the camera. Tap ⋯ → Open in browser, then try again." : "Camera blocked. Allow it in your browser settings, then reload."); return false; }
  video.srcObject = stream; video.muted = true; video.playsInline = true;
  try { await video.play(); } catch (e) {}
  for (let k = 0; k < 50 && !(video.videoWidth > 0); k++) await wait(100);
  camReady = true;
  status("Loading hand tracking… (the first time takes a few seconds)");
  if (await startWorker(MOBILE ? "CPU" : "GPU")) return true;
  if (await startMain()) return true;
  status("Hand tracking couldn't start on this device. Try Chrome on a newer phone or computer.");
  return false;
}
async function startWorker(prefer) {
  if (!window.Worker || !window.createImageBitmap) return false;
  const worker = new Worker("/js/airlo-worker.js?v=1");
  const ok = await new Promise(res => {
    const to = setTimeout(() => res(false), 60000);
    worker.onmessage = e => { if (e.data.type === "ready") { clearTimeout(to); res(true); } else if (e.data.type === "error") { clearTimeout(to); res(false); } };
    worker.onerror = () => { clearTimeout(to); res(false); };
    worker.postMessage({type: "init", prefer});
  });
  if (!ok) { worker.terminate(); return false; }
  let busy = false;
  worker.onmessage = e => { if (e.data.type === "result") { busy = false; onResult(e.data.hands); } };
  const pump = async () => {
    if (!busy && video.readyState >= 2 && video.videoWidth) {
      busy = true;
      try { const bmp = await createImageBitmap(video); worker.postMessage({type: "frame", frame: bmp, t: performance.now()}, [bmp]); } catch (e) { busy = false; }
    }
    requestAnimationFrame(pump);
  };
  requestAnimationFrame(pump);
  return true;
}
async function startMain() {
  try {
    const V = await import("/js/mediapipe/vision_bundle.mjs");
    const files = await V.FilesetResolver.forVisionTasks("/js/mediapipe/wasm");
    const lmk = await V.HandLandmarker.createFromOptions(files, {baseOptions: {modelAssetPath: "/js/mediapipe/hand_landmarker.task", delegate: "CPU"}, runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: 0.45, minHandPresenceConfidence: 0.45, minTrackingConfidence: 0.45});
    let last = -1;
    const loop = () => {
      if (video.readyState >= 2 && video.currentTime !== last) { last = video.currentTime; try { const r = lmk.detectForVideo(video, performance.now()); onResult((r.landmarks || []).map(h => h.map(p => ({x: p.x, y: p.y})))); } catch (e) {} }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return true;
  } catch (e) { return false; }
}
let seenHand = false;
function onResult(raw) {
  if (raw.length && !seenHand) { seenHand = true; status(""); }
  if (!seenHand) status("Show your hands to the camera, about an arm's length away");
  updateHands(raw);
}

/* ---------- recording (stays on this device) ---------- */
let rec = null, chunks = [], recTimer = null;
function toggleRec() {
  const btn = $("#rec");
  if (rec) { rec.stop(); return; }
  if (!window.MediaRecorder || !cv.captureStream) { status("Recording isn't supported in this browser."); return; }
  const tracks = cv.captureStream(30).getVideoTracks();
  if (recDest) tracks.push(...recDest.stream.getAudioTracks());
  const type = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(t => MediaRecorder.isTypeSupported(t)) || "";
  rec = new MediaRecorder(new MediaStream(tracks), type ? {mimeType: type} : {});
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    clearTimeout(recTimer);
    const mime = rec.mimeType || type || "video/webm", blob = new Blob(chunks, {type: mime}); chunks = []; rec = null;
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "airlo-" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + (mime.includes("mp4") ? ".mp4" : ".webm");
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    btn.textContent = "● Record"; btn.classList.remove("on"); status("Saved to your Downloads");
    setTimeout(() => status(""), 3000);
  };
  rec.start(1000); btn.textContent = "■ Stop"; btn.classList.add("on");
  recTimer = setTimeout(() => rec && rec.stop(), 60000);
}

/* ---------- start ---------- */
document.querySelectorAll("#tabs button").forEach(b => b.addEventListener("click", () => select(b.dataset.i)));
$("#clear").addEventListener("click", () => harp.reset());
$("#rec").addEventListener("click", toggleRec);
if (IN_APP) $("#inapp").hidden = false;
let saved = "harp"; try { saved = localStorage.getItem("airlo-inst") || "harp"; } catch (e) {}
resize(); select(INSTRUMENTS[saved] ? saved : "harp"); requestAnimationFrame(frame);
$("#start").addEventListener("click", async () => {
  initAudio();
  $("#intro").hidden = true; $("#ui").hidden = false;
  if (!TEST) await startTracking();
});

/* testing hook (only with #test in the address): feed hands without a camera */
if (TEST) window.airlo = {feed: raw => updateHands(raw), select, hands: () => hands, inst: () => inst, start: () => $("#start").click()};
