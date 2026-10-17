import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { analyzeMotionTrack, correlateGrayTranslation } from '../engine/qa/motion-stability.mjs';
const { createCamera } = createRequire(import.meta.url)('../engine/motion/camera.js');

function samples(camera, count = 91) {
  return Array.from({ length: count }, (_, frame) => ({ frame, time: frame / 30,
    ...camera.at(frame / 30), bbox: camera.bboxAt(frame / 30),
  }));
}
const moving = () => createCamera({ width: 1080, height: 1920, duration: 3, holdIn: 0.3,
  holdOut: 0.3, to: { scale: 1.06, x: -12, y: -8 } });

test('camera defaults to static and random seek order cannot accumulate transform drift', () => {
  const camera = createCamera({ width: 1080, height: 1920 });
  assert.deepEqual(camera.at(20), camera.at(-1));
  const animated = moving();
  const expected = animated.at(1.3);
  for (const time of [2, 0, 30, -2]) animated.at(time);
  assert.deepEqual(animated.at(1.3), expected);
});

test('camera has exact holds/endpoints, fixed pixel origin and a single transform', () => {
  const camera = moving();
  assert.equal(camera.at(0.2).scale, 1);
  assert.equal(camera.at(2.8).scale, 1.06);
  const element = { style: {} };
  camera.apply(element, 0.1);
  const origin = element.style.transformOrigin;
  camera.apply(element, 1.5);
  assert.equal(element.style.transformOrigin, origin);
  assert.equal(element.style.width, '1080px');
  assert.equal(element.style.height, '1920px');
  assert.equal(element.style.transform, camera.at(1.5).transform);
});

test('short camera moves, overshoot easing and undocumented large zooms are refused', () => {
  for (const options of [
    { to: { scale: 1.06 }, duration: 0.4 },
    { to: { scale: 1.2 } },
    { easing: 'elastic' },
    { holdIn: -1 },
    { width: 0 },
  ]) assert.throws(() => createCamera({ width: 1080, height: 1920, ...options }));
  assert.doesNotThrow(() => createCamera({ width: 1080, height: 1920, to: { scale: 1.3 },
    allowDetailZoom: true, reason: 'Necessary document detail' }));
});

test('every-frame clean sine zoom passes monotonic, velocity, bbox and endpoint checks', () => {
  const camera = moving(), observed = samples(camera);
  const report = analyzeMotionTrack({ samples: observed, easing: camera.config.easing,
    expectedAt: camera.at, expectedBBoxAt: camera.bboxAt,
    expectedStart: { ...camera.at(0), frame: 0 }, expectedEnd: { ...camera.at(3), frame: 90 } });
  assert.equal(report.result, 'PASS');
  assert.equal(report.scaleMonotonic, true);
  assert.equal(report.velocitySpikes, 0);
});

test('clean smoothstep push with long holds does not create median-velocity false warnings', () => {
  const camera = createCamera({ width: 1000, height: 1000, duration: 3, holdIn: 1, holdOut: 1,
    easing: 'smoothstep', to: { scale: 1.04 } });
  assert.equal(analyzeMotionTrack({ samples: samples(camera) }).result, 'PASS');
});

test('one-frame camera jitter is detected from transform and bbox independently', () => {
  const camera = moving(), observed = samples(camera);
  observed[45].x += 10;
  observed[45].bbox.x += 10;
  const report = analyzeMotionTrack({ samples: observed, expectedAt: camera.at, expectedBBoxAt: camera.bboxAt });
  assert.equal(report.result, 'FAIL');
  assert.ok(report.reversals > 0);
  assert.ok(report.velocitySpikes > 0);
  assert.ok(report.errors.some(error => error.code === 'CAMERA_TRANSFORM_DISCONTINUITY'));
  assert.ok(report.errors.some(error => error.code === 'CAMERA_BBOX_DISCONTINUITY'));
});

test('nested-layout bbox jump fails even when outer camera transform is static', () => {
  const observed = samples(createCamera({ width: 1080, height: 1920 }));
  observed[5].bbox.y += 4;
  const report = analyzeMotionTrack({ samples: observed });
  assert.equal(report.result, 'FAIL');
  assert.ok(report.errors.some(error => error.code === 'CAMERA_BBOX_JUMP'));
});

test('intentional cut is exempt only at the annotated frame and needs a reason', () => {
  const observed = samples(createCamera({ width: 1080, height: 1920 }));
  for (let i = 45; i < observed.length; i++) { observed[i].x = 100; observed[i].bbox.x = 100; }
  assert.equal(analyzeMotionTrack({ samples: observed, cuts: [{ frame: 45, reason: 'Static reframe cut' }] }).result, 'PASS');
  assert.notEqual(analyzeMotionTrack({ samples: observed, cuts: [{ frame: 44, reason: 'Wrong frame' }] }).result, 'PASS');
  assert.throws(() => analyzeMotionTrack({ samples: observed, cuts: [{ frame: 45 }] }));
});

test('missing frame or missing endpoint is a coverage failure', () => {
  const camera = moving(), observed = samples(camera);
  observed.splice(20, 1);
  const report = analyzeMotionTrack({ samples: observed, expectedEnd: { ...camera.at(3), frame: 91 } });
  assert.equal(report.result, 'FAIL');
  assert.ok(report.errors.some(error => error.code === 'CAMERA_FRAME_COVERAGE_GAP'));
  assert.ok(report.errors.some(error => error.code === 'CAMERA_ENDPOINT_MISSING'));
});

test('fixed reference crop correlation measures displacement and rejects flat material', () => {
  const width = 32, height = 32;
  const reference = Uint8Array.from({ length: width * height }, (_, i) => (i * 37 + Math.floor(i / width) ** 2 * 11) % 251);
  const current = new Uint8Array(reference.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width - 2; x++) current[y * width + x + 2] = reference[y * width + x];
  const result = correlateGrayTranslation(reference, current, width, height, 3);
  assert.equal(result.dx, 2); assert.equal(result.dy, 0);
  assert.ok(result.correlation > 0.9999);
  const still = correlateGrayTranslation(reference, reference, width, height, 3);
  assert.equal(still.dx, 0); assert.equal(still.dy, 0);
  assert.equal(correlateGrayTranslation(new Uint8Array(1024), new Uint8Array(1024), width, height).result, 'UNINFORMATIVE');
});
