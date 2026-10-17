/* A time-pure camera for a single, fixed-size raster viewport wrapper.
 * Original implementation. No renderer, framework, clock, or random source.
 * Browser classic script: EngineMotion.createCamera(...); Node: require(...).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EngineMotion = Object.freeze({ ...(root.EngineMotion || {}), ...api });
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const finite = (value, name) => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  };
  const clamp = value => Math.max(0, Math.min(1, value));
  const clean = (value, digits) => Number(value.toFixed(digits));
  const easings = Object.freeze({
    easeInOutSine: t => (1 - Math.cos(Math.PI * t)) / 2,
    smoothstep: t => t * t * (3 - 2 * t),
  });
  const pose = (value, fallback) => Object.freeze({
    scale: finite(value?.scale ?? fallback.scale, 'scale'),
    x: finite(value?.x ?? fallback.x, 'x'),
    y: finite(value?.y ?? fallback.y, 'y'),
  });

  function createCamera(options = {}) {
    const width = finite(options.width, 'width');
    const height = finite(options.height, 'height');
    if (width <= 0 || height <= 0) throw new RangeError('fixed dimensions must be positive');
    const from = pose(options.from, { scale: 1, x: 0, y: 0 });
    const to = pose(options.to, from); // No automatic Ken Burns: the default is static.
    if (from.scale <= 0 || to.scale <= 0) throw new RangeError('scale must be positive');
    const moving = ['scale', 'x', 'y'].some(key => from[key] !== to[key]);
    const start = finite(options.start ?? 0, 'start');
    const duration = finite(options.duration ?? (moving ? 1.2 : 0), 'duration');
    const holdIn = finite(options.holdIn ?? (moving ? 0.12 : 0), 'holdIn');
    const holdOut = finite(options.holdOut ?? (moving ? 0.12 : 0), 'holdOut');
    if (duration < 0 || holdIn < 0 || holdOut < 0 || holdIn + holdOut > duration)
      throw new RangeError('holds must fit within the non-negative duration');
    const activeDuration = duration - holdIn - holdOut;
    if (moving && activeDuration < 0.6 - 1e-9)
      throw new RangeError('camera movement needs at least 0.6 s excluding holds');
    const ratio = Math.max(from.scale, to.scale) / Math.min(from.scale, to.scale);
    if (ratio > 1.07 + 1e-9 && !(options.allowDetailZoom === true && options.reason?.trim()))
      throw new RangeError('zoom beyond 7% requires allowDetailZoom and a document-detail reason');
    const easing = options.easing ?? 'easeInOutSine';
    if (!easings[easing]) throw new RangeError('camera easing must be monotonic and non-overshooting');
    const originX = finite(options.originX ?? width / 2, 'originX');
    const originY = finite(options.originY ?? height / 2, 'originY');
    const config = Object.freeze({
      id: options.id ?? 'camera', width, height, from, to, moving, start, duration,
      holdIn, holdOut, activeDuration, easing, originX, originY,
      reason: options.reason ?? null,
    });

    function at(time) {
      finite(time, 'time');
      const progress = moving ? clamp((time - start - holdIn) / activeDuration) : 0;
      const eased = easings[easing](progress);
      // Stable precision on every seek. Millipixel translation avoids 1-pixel stair steps.
      const scale = clean(from.scale + (to.scale - from.scale) * eased, 8);
      const x = clean(from.x + (to.x - from.x) * eased, 4);
      const y = clean(from.y + (to.y - from.y) * eased, 4);
      return {
        scale, x, y, progress, easing, width, height, originX, originY,
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      };
    }

    function apply(element, time) {
      if (!element?.style) throw new TypeError('camera wrapper needs an element with a style');
      const value = at(time);
      // Assign absolute values; never accumulate deltas or measure layout during a move.
      Object.assign(element.style, {
        width: `${width}px`, height: `${height}px`,
        transformOrigin: `${originX}px ${originY}px`, transform: value.transform,
      });
      return value;
    }

    function bboxAt(time, left = 0, top = 0) {
      const value = at(time);
      return {
        x: left + value.x + originX * (1 - value.scale),
        y: top + value.y + originY * (1 - value.scale),
        width: width * value.scale, height: height * value.scale,
      };
    }
    return Object.freeze({ config, at, apply, bboxAt });
  }
  return { createCamera };
});
