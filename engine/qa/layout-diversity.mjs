/** Original plan-level editorial diagnostic. It never certifies aesthetics.
 * Call once with ordered SHOTS, not a frame sample stream. */
const words = value => String(value ?? '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[_\s/]+/g, '-').replace(/-+/g, '-');
const absent = value => value == null || /^(none|no|absent|hidden|yok|n\/a)$/.test(String(value).trim().toLowerCase());
const position = value => /(?:^|-)(?:bottom|lower|alt)(?:-|$)/.test(value) ? 'bottom' : /(?:^|-)(?:top|upper|ust)(?:-|$)/.test(value) ? 'top' : /(?:^|-)(?:center|centre|middle|orta)(?:-|$)/.test(value) ? 'middle' : /(?:^|-)(?:left|sol)(?:-|$)/.test(value) ? 'left' : /(?:^|-)(?:right|sag)(?:-|$)/.test(value) ? 'right' : '';
function role(value, kind) {
  if (absent(value)) return 'none';
  const s = words(value), pos = position(s);
  if (kind === 'frame') {
    if (/unbounded|unframed|open-surface/.test(s)) return 'unbounded';
    if (/full-?bleed|edge-to-edge|full-?screen/.test(s)) return 'full-bleed';
    if (/split|divided/.test(s)) return 'split';
    if (/bounded|framed|card|panel/.test(s)) return 'bounded';
  }
  if (kind === 'caption') return pos || s.replace(/captions?-?/, '');
  if (kind === 'headline') {
    if (/star|rating/.test(s)) return 'rating-context' + (pos ? ':' + pos : '');
    if (/schematic|disclosure/.test(s)) return 'disclosure' + (pos ? ':' + pos : '');
    if (pos) return pos;
  }
  if (kind === 'material') {
    if (pos) return pos;
    // Object names and content-specific counts do not create layout diversity.
    const type = /route|path/.test(s) ? 'route' : /map|cartograph/.test(s) ? 'map' : /document|page|newspaper/.test(s) ? 'document' : /photo|image|raster|archive/.test(s) ? 'image' : /diagram|graphic/.test(s) ? 'diagram' : /date|year|number/.test(s) ? 'number' : /word|type|text/.test(s) ? 'text' : s;
    return type + (pos ? ':' + pos : '');
  }
  return s;
}
function objectSignature(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return {};
  const result = {};
  for (const part of value.split(/[|;,\n]+/)) {
    const m = part.trim().match(/^(headline|header|title|caption|captions|image|material|primary|frame)\s*(?::|=|\s)\s*(.+)$/i);
    if (m) result[m[1].toLowerCase()] = m[2];
  }
  return result;
}
export function canonicalizeLayoutSignature(input, { canvasWidth = 1080, canvasHeight = 1920 } = {}) {
  const s = objectSignature(input), headline = s.headline ?? s.header ?? s.title;
  const material = s.material ?? s.image ?? s.primary;
  const caption = s.caption ?? s.captions ?? (/caption/i.test(String(s.secondary)) ? s.secondary : undefined);
  const missing = [['frame', s.frame], ['headline', headline], ['material', material], ['caption', caption]].filter(([, value]) => value === undefined).map(([key]) => key);
  const canonical = { frame: role(s.frame, 'frame'), headline: role(headline, 'headline'), material: role(material, 'material'), caption: role(caption, 'caption') };
  const geometry = s.primary_geometry ?? s.material_geometry;
  if (Array.isArray(geometry) && geometry.length === 4 && geometry.every(Number.isFinite)) {
    const [x, y, width, height] = geometry;
    canonical.material_region = width >= canvasWidth * .85 && height >= canvasHeight * .85 ? 'full' : `${position(y + height / 2 < canvasHeight / 3 ? 'top' : y + height / 2 > canvasHeight * 2 / 3 ? 'bottom' : 'middle')}-${x + width / 2 < canvasWidth / 3 ? 'left' : x + width / 2 > canvasWidth * 2 / 3 ? 'right' : 'center'}`;
  } else if (canonical.frame === 'full-bleed' && canonical.material === 'image') canonical.material_region = 'full';
  return { canonical, key: JSON.stringify(canonical), complete: missing.length === 0, missing };
}
export function analyzeLayoutDiversity(shots, { runLength = 3, ...canvas } = {}) {
  if (!Array.isArray(shots)) throw new TypeError('shots must be an ordered array');
  if (!Number.isInteger(runLength) || runLength < 3) throw new RangeError('runLength must be an integer >= 3');
  const warnings = [], signatures = [], seen = new Set();
  if (shots.length === 0) warnings.push({ code: 'LAYOUT_PLAN_EMPTY', severity: 'review', message: 'No shots were supplied; no layout-diversity conclusion can be drawn.' });
  for (const [index, shot] of shots.entries()) {
    const id = shot.scene_id ?? shot.id;
    if (!id || seen.has(id)) {
      warnings.push({ code: 'LAYOUT_SHOT_ID_REVIEW', severity: 'review', index, scene_id: id ?? null, message: 'Expected unique shot identifiers, not repeated frame samples.' });
      signatures.push({ index, scene_id: id ?? null, complete: false, key: null });
      continue;
    }
    seen.add(id);
    const item = canonicalizeLayoutSignature(shot.layout_signature, canvas);
    const record = { index, scene_id: id, ...item, justification: shot.repetition_rationale ?? shot.repetition_justification ?? shot.justification ?? null };
    signatures.push(record);
    if (!item.complete) warnings.push({ code: 'LAYOUT_SIGNATURE_INCOMPLETE', severity: 'review', scene_id: id, missing: item.missing, message: 'Declare frame, headline, material and caption roles; explicit none is valid.' });
  }
  let start = 0;
  while (start < signatures.length) {
    if (!signatures[start].complete) { start++; continue; }
    let end = start + 1;
    while (end < signatures.length && signatures[end].complete && signatures[end].key === signatures[start].key) end++;
    if (end - start >= runLength) warnings.push({ code: 'LAYOUT_REPETITION_WARNING', severity: 'review', start_index: start, end_index: end - 1, run_length: end - start, scene_ids: signatures.slice(start, end).map(s => s.scene_id), canonical_signature: signatures[start].canonical, justifications: signatures.slice(start, end).filter(s => s.justification).map(s => ({ scene_id: s.scene_id, reason: s.justification })), human_review_required: true, message: 'Repeated composition may be intentional. Review its narrative reason; justification does not silently approve aesthetics.' });
    start = end;
  }
  return { schema_version: '1.0', status: warnings.length ? 'REVIEW_REQUIRED' : 'PASS', hard_error: false, technical_not_aesthetic_approval: true, input_scope: 'ordered shots/scenes, not sampled frames', shot_count: shots.length, threshold: runLength, warnings, signatures, limitation: 'Plan-level canonical roles are a diagnostic, not pixel-derived similarity. Validate the actual compositions visually; different words may still describe equivalent arrangements.' };
}
