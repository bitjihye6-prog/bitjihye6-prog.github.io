/* Airlo: hand tracking for two hands, off the main thread.
   Frames arrive as ImageBitmaps from the page and are closed right after use; nothing is stored or sent anywhere. */
var exports = {}, module = {exports: exports};
importScripts("/js/mediapipe/vision_bundle_worker.js");
var V = module.exports && module.exports.HandLandmarker ? module.exports : exports;
var lmk = null, files = null;
function make(delegate) {
  return V.HandLandmarker.createFromOptions(files, {
    baseOptions: {modelAssetPath: "/js/mediapipe/hand_landmarker.task", delegate: delegate},
    runningMode: "VIDEO", numHands: 2,
    minHandDetectionConfidence: 0.45, minHandPresenceConfidence: 0.45, minTrackingConfidence: 0.45
  });
}
self.onmessage = async function (e) {
  var d = e.data;
  if (d.type === "init") {
    var order = d.prefer === "GPU" ? ["GPU", "CPU"] : ["CPU"];
    try {
      files = files || await V.FilesetResolver.forVisionTasks("/js/mediapipe/wasm");
      if (lmk) { try { lmk.close(); } catch (x) {} lmk = null; }
      for (var i = 0; i < order.length && !lmk; i++) { try { lmk = await make(order[i]); self.postMessage({type: "ready", delegate: order[i]}); } catch (x) { lmk = null; } }
      if (!lmk) self.postMessage({type: "error"});
    } catch (err) { self.postMessage({type: "error"}); }
  } else if (d.type === "frame") {
    var hands = [];
    try {
      var r = lmk.detectForVideo(d.frame, d.t);
      (r.landmarks || []).forEach(function (h) { hands.push(h.map(function (p) { return {x: p.x, y: p.y}; })); });
    } catch (err) {}
    try { d.frame.close(); } catch (x) {}
    self.postMessage({type: "result", hands: hands});
  }
};
