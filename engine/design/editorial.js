/* Original editorial mechanics: one event clock and one route geometry authority.
 * No palette, layout, typography, channel identity or rendering dependency. */
(function (root) {
  'use strict';
  const finite = (value, name) => { if (!Number.isFinite(value)) throw new TypeError(name + ' must be finite'); return value; };
  const clamp = value => Math.max(0, Math.min(1, value));
  function routeProgress(time, start, duration) {
    finite(time, 'time'); finite(start, 'start'); finite(duration, 'duration');
    if (duration <= 0) throw new RangeError('duration must be positive');
    const p = clamp((time - start) / duration);
    return p * p * (3 - 2 * p);
  }
  function sampleRoute(path, progress) {
    finite(progress, 'progress');
    if (!path || typeof path.getTotalLength !== 'function' || typeof path.getPointAtLength !== 'function') throw new TypeError('SVG path geometry is required');
    const length = finite(path.getTotalLength(), 'path length');
    if (length <= 0) throw new RangeError('path must have positive length');
    const p = clamp(progress), distance = p * length;
    const point = path.getPointAtLength(distance);
    // Sample a symmetric tangent where possible, one-sided at true endpoints.
    // No accumulated state or stale geometry cache: the same input has one result.
    const epsilon = Math.max(0.0001, Math.min(0.5, length / 1000));
    const a = path.getPointAtLength(Math.max(0, distance - epsilon));
    const b = path.getPointAtLength(Math.min(length, distance + epsilon));
    for (const [name, value] of Object.entries({ x: point.x, y: point.y, ax: a.x, ay: a.y, bx: b.x, by: b.y })) finite(value, name);
    return { x: point.x, y: point.y, angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI, progress: p, length };
  }
  root.EngineEditorial = Object.freeze({ routeProgress, sampleRoute });
  if (typeof module !== 'undefined' && module.exports) module.exports = root.EngineEditorial;
})(typeof window === 'undefined' ? globalThis : window);
