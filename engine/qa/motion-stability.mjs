/** Camera QA operates on observed browser transforms/bounds, one sample per rendered frame.
 * Model-only samples are useful for unit tests, but must not be labelled rendered-frame evidence.
 */
const median = values => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const range = values => ({ min: Math.min(...values), max: Math.max(...values) });
const finite = value => typeof value === 'number' && Number.isFinite(value);
const positionTolerance = 0.025;
const scaleTolerance = 0.000002;

export function analyzeMotionTrack({
  id, scene, samples, fps = 30, expectedStart, expectedEnd, cuts = [],
  easing = 'unspecified', expectedAt, expectedBBoxAt, spikeRatio = 2.5,
  source = 'browser-observed',
}) {
  if (!Array.isArray(samples) || samples.length < 2)
    throw new TypeError('camera QA requires at least two observed frame samples');
  if (!finite(fps) || fps <= 0) throw new TypeError('fps must be positive');
  const errors = [], warnings = [];
  const note = (collection, code, sample, detail) => collection.push({ code, frame: sample.frame, time: sample.time, detail });
  const cutsByFrame = new Map();
  for (const cut of cuts) {
    if (!Number.isInteger(cut.frame) || !cut.reason?.trim()) throw new TypeError('cuts need an exact frame and a reason');
    cutsByFrame.set(cut.frame, cut.reason);
  }
  for (const sample of samples) {
    if (!Number.isInteger(sample.frame) || !['time', 'scale', 'x', 'y'].every(key => finite(sample[key])) || sample.scale <= 0)
      throw new TypeError('sample frame, time, scale, x and y must be finite valid values');
    if (!sample.bbox || !['x', 'y', 'width', 'height'].every(key => finite(sample.bbox[key])) || sample.bbox.width <= 0 || sample.bbox.height <= 0)
      throw new TypeError('every observed camera sample needs a non-empty bbox');
  }
  const intervals = [];
  let segment = 0;
  const lastDirection = { scale: 0, x: 0, y: 0 };
  let reversals = 0;
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index];
    if (expectedAt) {
      const expected = expectedAt(sample.time);
      for (const key of ['scale', 'x', 'y']) {
        const tolerance = key === 'scale' ? scaleTolerance : positionTolerance;
        if (Math.abs(sample[key] - expected[key]) > tolerance)
          note(errors, 'CAMERA_TRANSFORM_DISCONTINUITY', sample, `${key} differs from deterministic target`);
      }
    }
    if (expectedBBoxAt) {
      const expected = expectedBBoxAt(sample.time);
      for (const key of ['x', 'y', 'width', 'height']) {
        if (Math.abs(sample.bbox[key] - expected[key]) > 0.06)
          note(errors, 'CAMERA_BBOX_DISCONTINUITY', sample, `${key} differs from fixed-layout target`);
      }
    }
    if (!index) continue;
    const previous = samples[index - 1];
    const dt = sample.time - previous.time;
    if (sample.frame - previous.frame !== 1 || Math.abs(dt - 1 / fps) > 0.00001)
      note(errors, 'CAMERA_FRAME_COVERAGE_GAP', sample, 'Samples must cover every consecutive rendered frame');
    if (cutsByFrame.has(sample.frame)) {
      segment++;
      for (const key of Object.keys(lastDirection)) lastDirection[key] = 0;
      continue;
    }
    const delta = { scale: sample.scale - previous.scale, x: sample.x - previous.x, y: sample.y - previous.y };
    for (const key of Object.keys(delta)) {
      const tolerance = key === 'scale' ? scaleTolerance : positionTolerance;
      const direction = Math.abs(delta[key]) > tolerance ? Math.sign(delta[key]) : 0;
      if (direction && lastDirection[key] && direction !== lastDirection[key]) {
        reversals++;
        note(warnings, 'CAMERA_JITTER_WARNING', sample, `Unexpected ${key} direction reversal; annotate intentional cuts`);
      }
      if (direction) lastDirection[key] = direction;
    }
    const dimension = Math.max(previous.bbox.width, previous.bbox.height) / previous.scale;
    const displacement = Math.hypot(delta.x, delta.y, delta.scale * dimension);
    const bboxDisplacement = Math.hypot(...['x', 'y', 'width', 'height'].map(key => sample.bbox[key] - previous.bbox[key]));
    intervals.push({ sample, segment, displacement, bboxDisplacement, speed: displacement / dt });
    if (displacement < 0.002 && bboxDisplacement > 0.08)
      note(errors, 'CAMERA_BBOX_JUMP', sample, 'Bounds moved while the camera transform stayed fixed');
  }
  let velocitySpikes = 0, bboxSpikes = 0;
  for (const segmentId of new Set(intervals.map(item => item.segment))) {
    const group = intervals.filter(item => item.segment === segmentId);
    for (const metric of ['displacement', 'bboxDisplacement']) {
      const active = group.filter(item => item[metric] > 0.002);
      if (active.length && active.length < Math.ceil(0.4 * fps) - 1 && active.reduce((sum, item) => sum + item[metric], 0) > 0.5)
        note(warnings, 'CAMERA_JITTER_WARNING', active[0].sample, `${metric} changes in less than 0.4 s; possible unannotated cut/transform discontinuity`);
      // Ignore holds and the first/last 15% of active intervals when finding typical speed.
      // A full-track median dominated by holds falsely flags a clean eased push.
      const trim = Math.floor(active.length * 0.15);
      const central = active.slice(trim, active.length - trim || undefined);
      const baseline = median(central.map(item => item[metric]));
      for (const item of active) {
        if (item[metric] > Math.max(0.08, baseline * spikeRatio)) {
          if (metric === 'displacement') velocitySpikes++; else bboxSpikes++;
          note(warnings, 'CAMERA_JITTER_WARNING', item.sample, `${metric} spike exceeds ${spikeRatio}× active median (${baseline.toFixed(5)})`);
        }
      }
    }
  }
  for (const [name, sample, expected] of [['start', samples[0], expectedStart], ['end', samples.at(-1), expectedEnd]]) {
    if (!expected) continue;
    for (const key of ['scale', 'x', 'y']) {
      if (Math.abs(sample[key] - expected[key]) > (key === 'scale' ? scaleTolerance : positionTolerance))
        note(errors, 'CAMERA_ENDPOINT_MISMATCH', sample, `${name} ${key} does not equal target`);
    }
    if (expected.frame !== undefined && sample.frame !== expected.frame)
      note(errors, 'CAMERA_ENDPOINT_MISSING', sample, `${name} frame not sampled`);
  }
  return {
    id, scene, source, result: errors.length ? 'FAIL' : warnings.length ? 'REVIEW_REQUIRED' : 'PASS',
    samples: samples.length, firstFrame: samples[0].frame, lastFrame: samples.at(-1).frame,
    time: [samples[0].time, samples.at(-1).time], fps, easing,
    scale: range(samples.map(s => s.scale)), x: range(samples.map(s => s.x)), y: range(samples.map(s => s.y)),
    scaleMonotonic: !warnings.some(w => w.detail.includes('scale direction')),
    reversals, velocitySpikes, bboxSpikes, maximumVelocity: Math.max(0, ...intervals.map(item => item.speed)),
    cutAnnotations: cuts, errors, warnings,
    medianPolicy: 'Per uninterrupted shot, exclude holds and outer 15% of active intervals; spike >2.5× active median and >0.08 px/frame.',
  };
}

/** Small normalized correlation probe for a fixed grayscale crop. No dependencies.
 * Both arrays represent the same crop of adjacent rendered/decoded frames.
 * A low-information crop returns UNINFORMATIVE, never a false PASS.
 */
export function correlateGrayTranslation(reference, current, width, height, radius = 3) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 8 || height < 8 || reference.length !== width * height || current.length !== width * height)
    throw new TypeError('correlation needs same-size grayscale arrays at least 8×8');
  if (!Number.isInteger(radius) || radius < 0 || radius * 2 >= Math.min(width, height))
    throw new RangeError('invalid correlation search radius');
  const scores = [];
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    let n = 0, a = 0, b = 0, aa = 0, bb = 0, ab = 0;
    // Use a fixed central area for every shift, avoiding an overlap-size bias.
    for (let y = radius; y < height - radius; y++) for (let x = radius; x < width - radius; x++) {
      const p = reference[y * width + x], q = current[(y + dy) * width + x + dx];
      n++; a += p; b += q; aa += p * p; bb += q * q; ab += p * q;
    }
    const denominator = Math.sqrt(Math.max(0, aa - a * a / n) * Math.max(0, bb - b * b / n));
    const correlation = denominator > n * 0.5 ? (ab - a * b / n) / denominator : null;
    scores.push({ dx, dy, correlation });
  }
  const usable = scores.filter(score => score.correlation !== null).sort((a, b) => b.correlation - a.correlation || Math.hypot(a.dx, a.dy) - Math.hypot(b.dx, b.dy));
  if (!usable.length) return { result: 'UNINFORMATIVE', reason: 'Insufficient crop contrast', dx: null, dy: null, correlation: null };
  const best = usable[0], zero = scores.find(score => !score.dx && !score.dy);
  return {
    result: best.correlation < 0.75 ? 'REVIEW_REQUIRED' : 'MEASURED',
    ...best, zeroCorrelation: zero.correlation,
    peakSeparation: best.correlation - (usable[1]?.correlation ?? best.correlation),
    atSearchBoundary: radius > 0 && (Math.abs(best.dx) === radius || Math.abs(best.dy) === radius),
  };
}
