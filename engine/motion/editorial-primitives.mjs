// Absolute-time motion: callers own tracks; these functions never start a clock.
import {progressAt, sampleObjectTrack} from './editorial-state.mjs';

const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
};

function objectPose(time, track) {
  const sampled = sampleObjectTrack(track, time);
  for (const endpoint of [track.from, track.to]) {
    if ('scale' in endpoint && endpoint.scale < 0) throw new RangeError('scale cannot be negative');
    if ('opacity' in endpoint && (endpoint.opacity < 0 || endpoint.opacity > 1)) {
      throw new RangeError('opacity must be between 0 and 1');
    }
  }
  // Preserve exact authored endpoints at clamped boundaries (no residual float drift).
  if (sampled.progress === 0) sampled.values = {...track.from};
  if (sampled.progress === 1) sampled.values = {...track.to};
  for (const [name, value] of Object.entries(sampled.values)) finite(value, `sampled ${name}`);
  return sampled;
}

// Distinct semantic names intentionally share one numerical implementation.
export const objectEnter = (time, track) => objectPose(time, track);
export const objectExit = (time, track) => objectPose(time, track);
export const sharedObjectTransition = (time, track) => objectPose(time, track);

/** Polyline distance is the single authority for both the revealed line and marker. */
export function samplePolyline(points, progress) {
  finite(progress, 'progress');
  if (!Array.isArray(points) || points.length < 2) throw new TypeError('At least two polyline points required');
  const source = points.map((point, i) => {
    if (!Array.isArray(point) || point.length !== 2) throw new TypeError(`Point ${i} must be [x, y]`);
    return [finite(point[0], `point ${i} x`), finite(point[1], `point ${i} y`)];
  });
  // Consecutive repeated vertices have no direction or length; discard them.
  const vertices = source.filter((point, i) => !i || point[0] !== source[i - 1][0] || point[1] !== source[i - 1][1]);
  const lengths = vertices.slice(1).map((point, i) => Math.hypot(point[0] - vertices[i][0], point[1] - vertices[i][1]));
  const pathLength = lengths.reduce((sum, length) => sum + length, 0);
  if (!Number.isFinite(pathLength) || pathLength <= 0) throw new RangeError('Polyline must have finite positive length');
  const p = Math.max(0, Math.min(1, progress));
  const visibleLength = pathLength * p;
  const visiblePoints = [vertices[0].slice()];
  let consumed = 0;
  let marker;
  for (let i = 0; i < lengths.length; i++) {
    const a = vertices[i], b = vertices[i + 1], length = lengths[i];
    if (visibleLength <= consumed + length || i === lengths.length - 1) {
      const fraction = Math.max(0, Math.min(1, (visibleLength - consumed) / length));
      marker = {x: a[0] + (b[0] - a[0]) * fraction, y: a[1] + (b[1] - a[1]) * fraction,
        angle: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI};
      if (fraction > 0) visiblePoints.push([marker.x, marker.y]);
      break;
    }
    visiblePoints.push(b.slice());
    consumed += length;
  }
  return {progress: p, pathLength, visibleLength, marker, visiblePoints};
}

export function pathDraw(time, {start, end, points, easing = 'smoothstep'}) {
  return samplePolyline(points, progressAt(time, {start, end, easing}));
}

/** Attach to the right-edge midpoint, with explicit offsets; no accumulated position. */
export function labelAttach({x, y, width, height}, {dx = 0, dy = 0} = {}) {
  for (const [name, value] of Object.entries({x, y, width, height, dx, dy})) finite(value, name);
  if (width < 0 || height < 0) throw new RangeError('Object bounds cannot have negative dimensions');
  return {x: finite(x + width + dx, 'attached x'), y: finite(y + height / 2 + dy, 'attached y')};
}
