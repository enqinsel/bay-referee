// SVG objects with explicit editorial roles; no scene layout or brand identity.
import {samplePolyline} from '../../motion/editorial-primitives.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
};
const positive = (value, name) => {
  finite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be positive`);
  return value;
};
const opacityOf = value => {
  finite(value, 'opacity');
  if (value < 0 || value > 1) throw new RangeError('opacity must be between 0 and 1');
  return value;
};
const colorOf = value => {
  if (typeof value !== 'string' || !value.trim() || /[;{}<>]/.test(value)) throw new TypeError('An explicit safe color is required');
  return escape(value);
};
const number = value => String(Object.is(value, -0) ? 0 : value);
function identity(id, ids) {
  if (typeof id !== 'string' || !/^[A-Za-z_][\w:.-]*$/.test(id)) throw new TypeError('A valid persistent SVG object ID is required');
  if (ids !== undefined) {
    if (!(ids instanceof Set)) throw new TypeError('ids must be a per-frame Set');
    if (ids.has(id)) throw new TypeError(`Duplicate component ID: ${id}`);
    ids.add(id);
  }
  return escape(id);
}
function boundsOf(points, padding = 0) {
  finite(padding, 'bounds padding');
  for (const point of points) {finite(point[0], 'bounds x'); finite(point[1], 'bounds y');}
  const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
  const x = Math.min(...xs) - padding, y = Math.min(...ys) - padding;
  const bounds = {x, y, width: Math.max(...xs) + padding - x, height: Math.max(...ys) + padding - y};
  for (const [name, value] of Object.entries(bounds)) finite(value, `bounds ${name}`);
  return bounds;
}
function textMetrics(text, {size, fontFamily, weight, letterSpacing, measureText}) {
  if (measureText !== undefined && typeof measureText !== 'function') throw new TypeError('measureText must be a function');
  const measured = measureText?.(text, {size, fontFamily, weight, letterSpacing});
  if (measured !== undefined) {
    const metrics = typeof measured === 'number' ? {width: measured, ascent: size * 1.05, descent: size * .35} : measured;
    for (const key of ['width', 'ascent', 'descent']) {
      finite(metrics?.[key], `text ${key}`);
      if (metrics[key] < 0) throw new RangeError('Text metrics cannot be negative');
    }
    return metrics;
  }
  // Safe estimate, not a font measurement: use an actual-font callback for final glyph QA.
  const glyphs = Array.from(text);
  const ems = glyphs.reduce((sum, c) => sum + (/\s/u.test(c) ? .55 : /^[ilI1.,:;'|!]$/.test(c) ? .6 : 1.1), 0);
  return {width: ems * size + Math.max(0, glyphs.length - 1) * Math.abs(letterSpacing), ascent: size * 1.05, descent: size * .35};
}
function label(props, role, defaultSize, defaultWeight) {
  const {id, x, y, text, tokens, anchor = 'start', opacity = 1, letterSpacing = 0, measureText, ids} = props;
  const objectId = identity(id, ids);
  finite(x, 'x'); finite(y, 'y'); finite(letterSpacing, 'letterSpacing'); opacityOf(opacity);
  if (typeof text !== 'string' || /[\r\n]/.test(text)) throw new TypeError('A single-line text string is required');
  if (!['start', 'middle', 'end'].includes(anchor)) throw new TypeError('Unknown text anchor');
  const size = positive(props.size ?? tokens?.type?.[role]?.size ?? defaultSize, 'size');
  const weight = positive(props.weight ?? tokens?.type?.[role]?.weight ?? defaultWeight, 'weight');
  const color = colorOf(props.color ?? tokens?.colors?.ink);
  const fontFamily = props.fontFamily ?? tokens?.fontFamily ?? 'inherit';
  if (typeof fontFamily !== 'string' || !fontFamily.trim() || /[;{}<>]/.test(fontFamily)) throw new TypeError('Invalid fontFamily');
  const metrics = textMetrics(text, {size, fontFamily, weight, letterSpacing, measureText});
  const left = x - (anchor === 'middle' ? metrics.width / 2 : anchor === 'end' ? metrics.width : 0);
  const bounds = {x: left, y: y - metrics.ascent, width: metrics.width, height: metrics.ascent + metrics.descent};
  for (const [name, value] of Object.entries(bounds)) finite(value, `text bounds ${name}`);
  return {id, bounds, svg: `<text id="${objectId}" x="${number(x)}" y="${number(y)}" fill="${color}" font-family="${escape(fontFamily)}" font-size="${number(size)}" font-weight="${number(weight)}" text-anchor="${anchor}" letter-spacing="${number(letterSpacing)}" opacity="${number(opacity)}">${escape(text)}</text>`};
}

/** Object or relationship name. Essential information may live here. */
export const TechnicalLabel = props => label(props, 'technical_label', 38, 650);
/** Optional provenance/category detail. No pill or container is added. */
export const MicroBadge = props => label(props, 'micro_label', 26, 500);
/** Verified quantity or explicitly qualitative state; no invented count-up. */
export const DataTag = props => label(props, 'number', 92, 700);

function lineObject(props, kind) {
  const {id, points, progress = 1, tokens, opacity = 1, dashed = false, ids} = props;
  const objectId = identity(id, ids), sampled = samplePolyline(points, progress);
  const width = positive(props.width ?? tokens?.stroke?.[kind === 'route' ? 'emphasis' : 'normal'] ?? (kind === 'route' ? 7 : 4), 'width');
  const stroke = colorOf(props.stroke ?? tokens?.colors?.episode_accent);
  opacityOf(opacity);
  if (typeof dashed !== 'boolean') throw new TypeError('dashed must be boolean');
  const path = sampled.visiblePoints.map((p, i) => `${i ? 'L' : 'M'}${number(p[0])} ${number(p[1])}`).join(' ');
  const visible = sampled.visibleLength > 0;
  const polyline = visible ? `<path d="${path}" fill="none" stroke="${stroke}" stroke-width="${number(width)}" stroke-linecap="round" stroke-linejoin="round"${dashed ? ` stroke-dasharray="${number(width * 2)} ${number(width * 2)}"` : ''}/>` : '';
  const boundPoints = sampled.visiblePoints.map(point => point.slice());
  let padding = visible ? width / 2 : 0, decoration = '';
  if (kind === 'arrow' && visible) {
    const length = positive(props.headLength ?? width * 4, 'headLength');
    const angle = sampled.marker.angle * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
    const {x, y} = sampled.marker, baseX = x - length * cos, baseY = y - length * sin;
    const head = [[x, y], [baseX - length * .45 * sin, baseY + length * .45 * cos], [baseX + length * .45 * sin, baseY - length * .45 * cos]];
    boundPoints.push(...head);
    decoration = `<polygon points="${head.map(p => p.map(number).join(',')).join(' ')}" fill="${stroke}"/>`;
  }
  if (kind === 'route') {
    const marker = props.marker ?? true;
    if (typeof marker !== 'boolean') throw new TypeError('marker must be boolean');
    const radius = positive(props.markerRadius ?? width, 'markerRadius');
    if (marker && visible) {
      const fill = colorOf(props.markerColor ?? props.stroke ?? tokens?.colors?.episode_accent);
      decoration = `<circle cx="${number(sampled.marker.x)}" cy="${number(sampled.marker.y)}" r="${number(radius)}" fill="${fill}"/>`;
      // The disk is conservatively included without inflating unrelated points.
      boundPoints.push([sampled.marker.x - radius, sampled.marker.y - radius], [sampled.marker.x + radius, sampled.marker.y + radius]);
    }
  }
  return {id, bounds: boundsOf(boundPoints, padding), svg: `<g id="${objectId}" opacity="${number(opacity)}">${polyline}${decoration}</g>`};
}

export const Connector = props => lineObject(props, 'connector');
export const Arrow = props => lineObject(props, 'arrow');
export const RouteObject = props => lineObject(props, 'route');

/** Treated raster is the document object. This adds neither a frame nor a shadow. */
export function DocumentObject({id, href, x, y, width, height, opacity = 1, rotate = 0, ids}) {
  const objectId = identity(id, ids);
  finite(x, 'x'); finite(y, 'y'); positive(width, 'width'); positive(height, 'height'); finite(rotate, 'rotate'); opacityOf(opacity);
  if (typeof href !== 'string' || !href.trim() || /[\x00-\x1f\x7f]/.test(href) || /^\s*(?:javascript|vbscript):/i.test(href)) throw new TypeError('A safe image href is required');
  if (/^\s*data:/i.test(href) && !/^data:image\/(?:png|jpeg|webp|avif|gif);base64,[A-Za-z0-9+/=]+$/i.test(href)) throw new TypeError('Only raster image data URLs are supported');
  const cx = x + width / 2, cy = y + height / 2, theta = rotate * Math.PI / 180;
  const corners = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]].map(([px, py]) => [cx + (px - cx) * Math.cos(theta) - (py - cy) * Math.sin(theta), cy + (px - cx) * Math.sin(theta) + (py - cy) * Math.cos(theta)]);
  return {id, bounds: boundsOf(corners), svg: `<image id="${objectId}" href="${escape(href)}" x="${number(x)}" y="${number(y)}" width="${number(width)}" height="${number(height)}" preserveAspectRatio="xMidYMid meet" opacity="${number(opacity)}" transform="rotate(${number(rotate)} ${number(cx)} ${number(cy)})"/>`};
}
