# Deterministic raster camera

`camera.js` is an original, dependency-free technical primitive. It defines no channel style. The default is a static camera; motion is allowed when it serves an editorial focus or comparison. A useful smooth document focus is not prohibited. Prefer a cut when movement would be unnecessary or unstable.

Load as a classic browser script and call `EngineMotion.createCamera`. Under Node use `createRequire(...)(...camera.js)`.

```js
const camera = EngineMotion.createCamera({
  id: 'document-focus', width: 1080, height: 1920,
  start: 20, duration: 2, holdIn: 0.15, holdOut: 0.2,
  from: { scale: 1, x: 0, y: 0 },
  to: { scale: 1.04, x: -12, y: -8 },
  easing: 'easeInOutSine',
});
function renderAt(time) {
  camera.apply(document.querySelector('[data-camera-id="document-focus"]'), time);
}
```

Use one fixed-size wrapper, with the raster child fixed in that wrapper. Do not independently animate the raster child or an ancestor of the camera. Do not tween the same transform with GSAP: a paused GSAP clock may call this absolute-time function, while `hf-seek` calls it directly as well. Width/height and transform origin stay fixed; no layout measurement, delta accumulation or wall-clock input occurs in the camera.

`duration` includes holds. Active motion must last at least **0.6 seconds**, with an initial and final hold. The current API implements `easeInOutSine` and `smoothstep`, both smooth, monotonic and without overshoot. Normal authored focus is **1.00→1.04–1.07**; the API rejects a zoom ratio above 7% unless a document-detail move supplies `allowDetailZoom: true` plus a non-empty `reason`. Smaller useful movement and static framing remain valid. A cubic-bezier camera curve is not currently an API easing option. Static reframes belong to separate shots with exact cut annotations. `at(time)` returns the pose; `bboxAt(time,left,top)` predicts the wrapper bounds in canvas coordinates when no ancestor applies a transform. Every value is recomputed from absolute time. Translation uses consistent 0.0001-pixel precision, not whole-pixel stepping.

`primitives.js` provides original time-pure `editorialCrop`, `maskedReveal`, `objectPush`, `numberReveal`, `focusHold`, and `routeDraw` helpers. Use a technique for its narrative role, not as an ambient effect. Crops establish fixed geometry, reveals keep layout stable, and `routeDraw` returns the same fraction used for the stroke so a travelling object can share its progress. These object/reveal durations are distinct from the camera's minimum active duration. HyperFrames remains the renderer; a paused GSAP clock may feed the shared seek functions.

## QA integration

Import `analyzeMotionTrack` from `../qa/motion-stability.mjs`. Sample **observed DOM** transform and `getBoundingClientRect()` at every output frame, after the composition seek, not just the pure camera's own values. Normalize observed bounds to canvas pixels if the page itself is scaled. Supply:

```js
analyzeMotionTrack({
  id: camera.config.id, scene: 'scene_04', fps: 30,
  samples: [{ frame: 600, time: 20, scale: 1, x: 0, y: 0,
    bbox: { x: 0, y: 0, width: 1080, height: 1920 } }, /* every frame */],
  easing: camera.config.easing,
  expectedAt: camera.at, expectedBBoxAt: camera.bboxAt,
  expectedStart: { ...camera.at(20), frame: 600 },
  expectedEnd: { ...camera.at(22), frame: 660 },
  cuts: [],
  source: 'browser-observed',
});
```

A track needs at least two frames. A cut `{frame,reason}` exempts only the interval entering that exact frame. Frames cannot silently be skipped. Warnings produce `REVIEW_REQUIRED`, not PASS. Transform/bbox/endpoint/coverage errors produce FAIL. Smooth easing speed naturally changes: the 2.5× spike baseline uses active intervals within each uninterrupted shot, excluding stable holds and the outer 15% of active intervals. This avoids treating the intended slow start/end as jitter. The existing discontinuity heuristic separately warns for an isolated change shorter than 0.4 seconds, so a one-frame jump cannot hide by becoming its own median. That diagnostic threshold is **not** permission to author a 0.4-second camera move: `createCamera` requires at least 0.6 seconds of active motion.

`correlateGrayTranslation(a,b,width,height,radius=3)` is a small dependency-free normalized-correlation check for the same fixed grayscale crop in adjacent **rendered or decoded frames**. Use a textured document patch that excludes changing captions, overlays and object animation; downsample both identically. It returns the best pixel displacement, correlation, peak separation and search-boundary flag. Low contrast returns `UNINFORMATIVE`; correlation <0.75 returns `REVIEW_REQUIRED`. The caller should compare measured displacement with the expected camera displacement. For static crops, high-confidence non-zero displacement is a jitter warning. Translation-only correlation cannot validate zoom or perspective by itself, and a search-boundary result needs a larger window or human review. No optical-flow model or extra renderer is installed.

Tests: `node --test tests/test_motion_stability.mjs`.
