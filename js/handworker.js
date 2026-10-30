/* Runs hand tracking off the main thread so the 3D trees never stutter.
   Frames arrive as ImageBitmaps from this page and are closed right after use; nothing is stored or sent anywhere. */
var exports = {}, module = {exports: exports};
importScripts("/js/mediapipe/vision_bundle.cjs");
var V = module.exports && module.exports.HandLandmarker ? module.exports : exports;
var lmk = null;
async function make(files, delegate) {
  return V.HandLandmarker.createFromOptions(files, {
    baseOptions: {modelAssetPath: "/js/mediapipe/hand_landmarker.task", delegate: delegate},
    runningMode: "VIDEO", numHands: 1,
    minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5
  });
}
self.onmessage = async function (e) {
  var d = e.data;
  if (d.type === "init") {
    try {
      var files = await V.FilesetResolver.forVisionTasks("/js/mediapipe/wasm");
      try { lmk = await make(files, "GPU"); } catch (err) { lmk = await make(files, "CPU"); }
      self.postMessage({type: "ready"});
    } catch (err) { self.postMessage({type: "error"}); }
  } else if (d.type === "frame") {
    var lm = null;
    try { var r = lmk.detectForVideo(d.frame, d.t); lm = r.landmarks && r.landmarks[0] ? r.landmarks[0].map(function (p) { return {x: p.x, y: p.y}; }) : null; }
    catch (err) {}
    d.frame.close();
    self.postMessage({type: "result", lm: lm});
  }
};
