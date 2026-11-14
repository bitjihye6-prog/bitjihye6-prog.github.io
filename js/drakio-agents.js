/* Drakio: the "Building your resume" screen from the app, replayed on the website.
   Nine named cursors bring in the nine agents and link them, the agents think as one pipeline,
   then the same cursors build the resume section by section. Same names, colours and timing as
   lib/screens/agents.dart (14 s of story at 1.35x, so about 10 seconds), on a made-up barista job.
   Static content only: every text below is fixed here, nothing comes from the URL or the page. */
(() => {
  const hosts = [...document.querySelectorAll("[data-drakio-agents]")];
  if (!hosts.length) return;
  const NS = "http://www.w3.org/2000/svg";
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOTAL = 14, SPEED = 1.35, P2 = 3.8, STEP2 = 0.6, P3 = 9.6, STEP3 = 0.23, FIN = 12.8;
  const made = i => 0.15 + i * 0.26 + 1.1;
  const AG = [
    ["Nova", "reads your resume", "#8B7BFF"], ["Lumen", "reads the job ad", "#2EE6C8"], ["Rhea", "finds keywords", "#FF5C93"],
    ["Mira", "matches skills", "#4AA8FF"], ["Ada", "checks your gaps", "#3DDC97"], ["Orion", "orders experience", "#C77DFF"],
    ["Iris", "writes sentences", "#5EC8FF"], ["Kai", "applies country style", "#FF7AB8"], ["Sol", "builds the PDF", "#9BE38B"]];
  const MSG = ["Read your resume · 3 jobs, 11 skills", "Read the ad · Barista", "Found 7 requirements", "Matched 5 of 7 from your resume",
    "1 gap confirmed by you", "Moved the lines that match to the top", "Wrote 1 new line from your answers", "Canada style · Letter", "PDF layout ready"];
  const SECS = ["header", "summary", "skills", "barista", "cashier", "server", "volunteer", "education", "licence"];
  const NODES = [[64, 58], [180, 58], [296, 58], [296, 154], [180, 154], [64, 154], [64, 250], [180, 250], [296, 250]];
  const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [0, 3], [2, 6], [1, 7]];
  const STARTS = [[30, 600], [330, 610], [20, 330], [340, 330], [180, 630], [120, 20], [250, 20], [10, 140], [350, 230]];
  const PAPER = { x: 48, y: 348, w: 264, h: 268 }, SECH = [30, 26, 18, 30, 28, 26, 22, 22, 18];
  const RECTS = (() => { const o = []; let y = PAPER.y + 10;
    for (let i = 0; i < 9; i++) { if (i === 8) { o.push({ x: PAPER.x + 162, y: o[7].y, w: 90, h: SECH[8] }); continue }
      const w = i === 7 ? 140 : PAPER.w - 24; o.push({ x: PAPER.x + 12, y, w, h: SECH[i] }); y += SECH[i] + 6 } return o })();
  const LOGS = [];
  AG.forEach(([n, job, c], i) => {
    LOGS.push([made(i), c, `${n} joined · ${job}`]);
    LOGS.push([P2 + i * STEP2 + .48, c, `${n} · ${MSG[i]}`]);
    LOGS.push([P3 + i * STEP3 + 1.35, c, `${n} built ${SECS[i]}`]);
  });
  LOGS.push([FIN + .4, "#3DDC97", "Resume ready · 6 of 7 matched"]);
  LOGS.sort((a, b) => a[0] - b[0]);

  const cl = x => x < 0 ? 0 : x > 1 ? 1 : x, ease = x => { x = cl(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2 };
  const el = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); parent && parent.appendChild(e); return e };
  const div = (cls, parent, text) => { const e = document.createElement("div"); e.className = cls; if (text != null) e.textContent = text; parent && parent.appendChild(e); return e };

  hosts.forEach(host => {
    host.classList.add("dka");
    const top = div("dka-top", host), dot = div("dka-dot", top), phase = div("dka-phase", top, "Agents joining"), timer = div("dka-time", top, "0.0s");
    const stage = div("dka-stage", host);
    const svg = el("svg", { viewBox: "0 0 360 640", role: "img", "aria-label": "Drakio's nine agents build a tailored barista resume in about 10 seconds" }, stage);
    const gEdges = el("g", {}, svg), gPaper = el("g", {}, svg), gNodes = el("g", {}, svg), gCur = el("g", {}, svg);
    const edges = EDGES.map(([a, b]) => el("line", { x1: NODES[a][0], y1: NODES[a][1], x2: NODES[a][0], y2: NODES[a][1], stroke: "#3A3A44", "stroke-width": 2, "stroke-linecap": "round" }, gEdges));
    const pulses = EDGES.map(() => el("circle", { r: 3.2, fill: "#5EC8FF", opacity: 0 }, gEdges));
    // the resume card
    el("rect", { x: 36, y: 336, width: 288, height: 292, rx: 18, fill: "#18181D", stroke: "#26262E" }, gPaper);
    const paper = el("rect", { x: PAPER.x, y: PAPER.y, width: PAPER.w, height: PAPER.h, rx: 6, fill: "#FAFAF7", opacity: .1 }, gPaper);
    const secs = RECTS.map((r, i) => {
      const g = el("g", { opacity: 0 }, gPaper), lines = [];
      if (i === 0) {
        lines.push(el("rect", { x: r.x + r.w / 2 - 54, y: r.y + 2, width: 108, height: 9, rx: 2, fill: "#111" }, g));
        lines.push(el("rect", { x: r.x + r.w / 2 - 80, y: r.y + 17, width: 160, height: 4, rx: 2, fill: "#888" }, g));
      } else {
        lines.push(el("rect", { x: r.x, y: r.y, width: Math.min(70, r.w * .6), height: 5, rx: 2, fill: "#111" }, g));
        const n = Math.max(1, Math.round((r.h - 9) / 7));
        for (let k = 0; k < n; k++) lines.push(el("rect", { x: r.x, y: r.y + 9 + k * 7, width: r.w * (k === n - 1 ? .62 : .96), height: 3.4, rx: 1.7, fill: "#9a9aa0" }, g));
      }
      const hi = el("rect", { x: r.x - 4, y: r.y - 3, width: r.w + 8, height: r.h + 4, rx: 4, fill: "none", stroke: AG[i][2], "stroke-width": 1.6, opacity: 0 }, g);
      return { g, lines, hi };
    });
    const ready = el("text", { x: 180, y: 324, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: "#F5F5F7", "font-family": "Manrope, system-ui, sans-serif" }, gPaper);
    ready.textContent = "Your tailored resume";
    // agents
    const nodes = NODES.map(([x, y], i) => {
      const g = el("g", { transform: `translate(${x} ${y}) scale(0)` }, gNodes);
      const halo = el("circle", { r: 30, fill: AG[i][2], opacity: 0 }, g);
      el("circle", { r: 22, fill: "#111115", stroke: AG[i][2], "stroke-width": 3 }, g);
      const t = el("text", { y: 6, "text-anchor": "middle", "font-size": 17, "font-weight": 800, fill: AG[i][2], "font-family": "Manrope, system-ui, sans-serif" }, g); t.textContent = AG[i][0][0];
      const n = el("text", { y: 42, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "#F5F5F7", "font-family": "Manrope, system-ui, sans-serif" }, g); n.textContent = AG[i][0];
      return { g, halo };
    });
    // named cursors
    const curs = AG.map(([n, , c]) => {
      const g = el("g", { opacity: 0 }, gCur);
      el("path", { d: "M0 0 L0 16 L4.5 12 L7.5 19 L10.5 17.6 L7.6 11 L13 11 Z", fill: c, stroke: "#0B0B0D", "stroke-width": 1.2, "stroke-linejoin": "round" }, g);
      const w = 8 + n.length * 6.4;
      el("rect", { x: 12, y: 16, width: w, height: 15, rx: 7.5, fill: c }, g);
      const t = el("text", { x: 12 + w / 2, y: 26.8, "text-anchor": "middle", "font-size": 9.5, "font-weight": 800, fill: "#0B0B0D", "font-family": "Manrope, system-ui, sans-serif" }, g); t.textContent = n;
      return g;
    });
    const log = div("dka-log", host);
    const rows = [0, 1, 2].map(() => { const r = div("dka-row", log), d = div("dka-ldot", r), t = div("dka-ltext", r); return { r, d, t } });
    const foot = div("dka-foot", host);
    const replay = document.createElement("button"); replay.type = "button"; replay.className = "dka-replay"; replay.textContent = "Replay ↺"; foot.appendChild(replay);
    const note = div("dka-note", foot, "Example job, not real data");

    const lerp = (a, b, k) => a + (b - a) * k;
    function curPos(i, t) {
      const [sx, sy] = STARTS[i], [nx, ny] = NODES[i], m = made(i);
      if (t < m) { const k = ease((t - (m - 1.1)) / 1.1); return [lerp(sx, nx + 14, k), lerp(sy, ny + 14, k)] }
      const b0 = P3 + i * STEP3, r = RECTS[i];
      if (t < b0) return [nx + 14, ny + 14];
      const tx = r.x + r.w * .55, ty = r.y + r.h * .5, k1 = ease((t - b0) / .9);
      if (t < b0 + .9) return [lerp(nx + 14, tx, k1), lerp(ny + 14, ty, k1)];
      const k2 = cl((t - b0 - .9) / .45); return [tx + Math.sin(k2 * 6) * 10, ty];
    }
    function draw(t) {
      const real = Math.min(t, TOTAL) / SPEED;
      timer.textContent = (t >= FIN ? (FIN + .4) / SPEED : real).toFixed(1) + "s";
      phase.textContent = t < P2 ? "Agents joining" : t < P3 ? "Agents thinking" : t < FIN ? "Building your resume" : "Ready · built in " + ((FIN + .4) / SPEED).toFixed(1) + " seconds";
      dot.classList.toggle("on", t >= FIN);
      AG.forEach((_, i) => {
        const m = made(i), s = ease((t - m) / .35) * (t >= m ? 1 : 0);
        const think = P2 + i * STEP2, glow = t >= think && t < think + 1 ? Math.sin(cl((t - think) / 1) * Math.PI) : 0;
        nodes[i].g.setAttribute("transform", `translate(${NODES[i][0]} ${NODES[i][1]}) scale(${(s * (1 + glow * .12)).toFixed(3)})`);
        nodes[i].halo.setAttribute("opacity", (glow * .28).toFixed(3));
        const p = curPos(i, t), vis = t > m - 1.1 && t < P3 + i * STEP3 + 1.6 ? 1 : 0;
        curs[i].setAttribute("opacity", vis); curs[i].setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
        const b = P3 + i * STEP3 + .9, k = cl((t - b) / .45);
        secs[i].g.setAttribute("opacity", k.toFixed(3));
        secs[i].hi.setAttribute("opacity", (k > 0 && t < b + 1.4 ? 1 - cl((t - b - .45) / .9) : 0).toFixed(3));
      });
      const linkT = made(8) + .3;
      EDGES.forEach(([a, b], j) => {
        const k = ease((t - linkT - j * .05) / .5), [ax, ay] = NODES[a], [bx, by] = NODES[b];
        edges[j].setAttribute("x2", lerp(ax, bx, k)); edges[j].setAttribute("y2", lerp(ay, by, k));
        const on = t >= P2 && t < P3; edges[j].setAttribute("stroke", on ? "#1F4560" : "#3A3A44");
        const ph = ((t - P2) * .9 + j * .17) % 1;
        pulses[j].setAttribute("opacity", on ? .9 : 0);
        pulses[j].setAttribute("cx", lerp(ax, bx, ph)); pulses[j].setAttribute("cy", lerp(ay, by, ph));
      });
      paper.setAttribute("opacity", (.1 + .9 * cl((t - (P3 - .4)) / .6)).toFixed(3));
      ready.textContent = t >= FIN ? "Ready · 6 of 7 matched" : "Your tailored resume";
      ready.setAttribute("fill", t >= FIN ? "#3DDC97" : "#F5F5F7");
      const shown = LOGS.filter(l => l[0] <= t).slice(-3).reverse();
      rows.forEach((r, i) => { const l = shown[i]; r.r.style.visibility = l ? "visible" : "hidden"; if (l) { r.d.style.background = l[1]; r.t.textContent = l[2] } });
    }
    let start = 0, raf = 0, running = false;
    function frame(now) { const t = (now - start) / 1000 * SPEED; draw(t); if (t < TOTAL + 2.5 * SPEED) raf = requestAnimationFrame(frame); else running = false }
    function play() { cancelAnimationFrame(raf); running = true; start = performance.now(); raf = requestAnimationFrame(frame) }
    replay.addEventListener("click", play);
    if (RM) { draw(TOTAL); return }
    draw(0);
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting && !running && !host.dataset.played) { host.dataset.played = "1"; play() } }) }, { threshold: .35 });
    io.observe(host);
  });
})();
