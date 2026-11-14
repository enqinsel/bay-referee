/** Read-only delivery gates. Native narration and manifest duration claims are never timing authority. */
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DUB_DURATION_TOLERANCE_SECONDS = 0.05;
const LANGUAGES = ['en', 'es'];
const SHA = /^[a-f0-9]{64}$/;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const dateTime = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
function number(value) {
  if (value === null || value === undefined || value === '') return NaN;
  return Number(value);
}
function gate(errors = [], details = {}) { return {status: errors.length ? 'FAIL' : 'PASS', errors, ...details}; }
function demand(condition, message) { if (!condition) throw new Error(message); }

/** Inclusive 50 ms bound; epsilon only absorbs IEEE-754 subtraction, never media rounding. */
export function evaluateDubDuration(masterSeconds, dubSeconds) {
  if (!finite(masterSeconds) || masterSeconds <= 0 || !finite(dubSeconds) || dubSeconds <= 0) {
    return gate(['Duration must be a finite positive number.'], {master_seconds: masterSeconds, dub_seconds: dubSeconds});
  }
  const delta = dubSeconds - masterSeconds;
  const epsilon = Math.min(1e-12, Number.EPSILON * Math.max(1, Math.abs(masterSeconds), Math.abs(dubSeconds)) * 4);
  return gate(Math.abs(delta) <= DUB_DURATION_TOLERANCE_SECONDS + epsilon ? [] : ['Dub differs from the full final master by more than 0.05 seconds.'], {
    master_seconds: masterSeconds, dub_seconds: dubSeconds, difference_seconds: delta,
    absolute_difference_seconds: Math.abs(delta), tolerance_seconds: DUB_DURATION_TOLERANCE_SECONDS,
  });
}

function audioFrames(decoded) {
  return decoded.frames ?? decoded.packets_and_frames?.filter(item => item.type === 'frame') ?? [];
}
function audioPackets(decoded) {
  return decoded.packets ?? decoded.packets_and_frames?.filter(item => item.type === 'packet') ?? [];
}
const pts = item => number(item.best_effort_timestamp_time ?? item.pts_time ?? item.pkt_pts_time);

/** ffprobe decodes frames, so nb_samples already excludes signalled MP3 priming/end padding. */
export function audioPresentation(metadata, decoded, extension) {
  const streams = metadata.streams ?? [];
  demand(streams.length === 1 && streams[0].codec_type === 'audio', 'Final dub must contain exactly one audio stream and no other streams.');
  const stream = streams[0];
  const sampleRate = number(stream.sample_rate);
  demand(Number.isInteger(sampleRate) && sampleRate > 0, 'Invalid audio sample rate.');
  demand(extension === '.mp3' ? stream.codec_name === 'mp3' : extension === '.wav' && /^pcm_/.test(stream.codec_name ?? ''), 'Final dub codec does not match WAV/MP3 delivery format.');
  const frames = audioFrames(decoded);
  demand(frames.length > 0, 'No decoded audio frames.');
  let samples = 0;
  const first = pts(frames[0]);
  demand(finite(first), 'Missing first decoded audio timestamp.');
  for (const frame of frames) {
    demand(frame.media_type === 'audio' && frame.stream_index === stream.index, 'Unexpected decoded stream.');
    demand(Number.isInteger(frame.nb_samples) && frame.nb_samples > 0, 'Invalid decoded audio sample count.');
    // ffprobe prints timestamps to six decimals; allow one sample plus that representation error.
    demand(finite(pts(frame)) && Math.abs(pts(frame) - (first + samples / sampleRate)) <= 1 / sampleRate + 0.000002, 'Decoded audio has a timestamp gap or overlap.');
    samples += frame.nb_samples;
  }
  demand(Number.isSafeInteger(samples), 'Invalid total decoded sample count.');
  let primingSamples = 0;
  if (extension === '.mp3') {
    const packets = audioPackets(decoded);
    const skips = packets.flatMap((packet, index) => (packet.side_data_list ?? []).filter(side => number(side.skip_samples) > 0).map(side => ({packet, index, samples: number(side.skip_samples)})));
    demand(skips.length <= 1, 'Multiple MP3 skip-sample regions are unsupported.');
    if (skips.length) {
      const skip = skips[0];
      demand(skip.index === 0 && Number.isInteger(skip.samples), 'MP3 priming must be signalled on the first packet.');
      demand(Math.abs(number(skip.packet.pts_time)) <= 1 / sampleRate, 'MP3 encoded timeline does not start at zero.');
      primingSamples = skip.samples;
      demand(Math.abs(first - primingSamples / sampleRate) <= 1 / sampleRate + 0.000002, 'MP3 decoded timestamp disagrees with signalled encoder priming.');
    }
  }
  const start = first - primingSamples / sampleRate;
  return {
    duration_seconds: samples / sampleRate, start_seconds: start, sample_rate: sampleRate,
    decoded_samples: samples, decoded_frame_count: frames.length, codec: stream.codec_name,
    duration_basis: 'ffprobe_decoded_samples', encoder_priming_samples: primingSamples,
    first_decoded_timestamp_seconds: first,
    container_start_seconds: Number.isFinite(number(metadata.format?.start_time)) ? number(metadata.format.start_time) : null,
    container_duration_seconds: Number.isFinite(number(metadata.format?.duration)) ? number(metadata.format.duration) : null,
    zero_start_tolerance_seconds: 1 / sampleRate + 0.000002,
  };
}

export function masterPresentation(metadata) {
  const video = metadata.streams?.filter(stream => stream.codec_type === 'video' && !stream.disposition?.attached_pic) ?? [];
  const audio = metadata.streams?.filter(stream => stream.codec_type === 'audio') ?? [];
  demand(video.length === 1 && audio.length === 1, 'Final master must have one video stream and one audio stream.');
  demand(String(metadata.format?.format_name).split(',').some(name => ['mov', 'mp4'].includes(name)), 'Final master is not an MP4 container.');
  const duration = number(metadata.format?.duration);
  const start = number(metadata.format?.start_time);
  demand(finite(duration) && duration > 0 && finite(start), 'Missing/nonfinite final master duration or start.');
  demand(finite(number(video[0].duration)) && number(video[0].duration) > 0, 'Missing video stream duration.');
  demand(finite(number(video[0].start_time)) && Math.abs(number(video[0].start_time)) <= 0.000001, 'Master video timeline does not start at zero.');
  return {duration_seconds: duration, start_seconds: start, duration_basis: 'ffprobe_format_duration_full_master', video_duration_seconds: number(video[0].duration), zero_start_tolerance_seconds: 0.000001};
}

/** No prepare(), render, trim, speed change, media write, or network access. */
export function probeMedia(filename, {ffprobePath, run = spawnSync} = {}) {
  const binary = ffprobePath ?? require('@ffprobe-installer/ffprobe').path;
  const invoke = args => {
    const result = run(binary, ['-v', 'error', ...args, '-of', 'json', filename], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 120000, windowsHide: true});
    demand(!result.error && result.status === 0 && !String(result.stderr ?? '').trim(), `ffprobe failed: ${result.error?.message ?? result.stderr ?? result.status}`);
    try { return JSON.parse(result.stdout); } catch { throw new Error('ffprobe returned invalid JSON.'); }
  };
  const metadata = invoke(['-show_streams', '-show_format']);
  if (path.extname(filename) === '.mp4') return masterPresentation(metadata);
  const decoded = invoke(['-select_streams', 'a:0', '-show_frames', '-show_packets']);
  return audioPresentation(metadata, decoded, path.extname(filename));
}

export function minimumFiles(slug) {
  const files = {asset_manifest: '07_assets/asset-manifest.json', master_tr: `03_video/${slug}-bay-referee-tr.mp4`, youtube_tags: '06_social/youtube-tags.txt', semantic_sync: '08_delivery/semantic-sync.json'};
  for (const lang of ['tr', ...LANGUAGES]) {
    files[`script_${lang}`] = `01_script/script-${lang}.txt`;
    files[`captions_${lang}`] = `04_captions/captions-${lang}.srt`;
    files[`cover_${lang}`] = `05_cover/cover-${lang}-1080x1920.png`;
    for (const kind of ['title', 'description', 'hashtags']) files[`${kind}_${lang}`] = `06_social/${kind}-${lang}.txt`;
  }
  for (const lang of LANGUAGES) {
    for (const ext of ['wav', 'mp3']) files[`youtube_dub_${lang}_${ext}`] = `02_audio/${lang}/youtube-dub-${lang}.${ext}`;
    files[`alignment_${lang}`] = `02_audio/${lang}/youtube-dub-alignment-${lang}.json`;
    files[`aligned_word_map_${lang}`] = `02_audio/${lang}/youtube-dub-word-map-${lang}.json`;
  }
  return files;
}

// Match source/credit typography. Club or competition names and quoted speakers
// can be part of the story, so a bare organisation name is not a violation.
function hasSourceLabel(value) {
  const text = value.normalize('NFC').replaceAll('İ', 'i');
  const sourceUrl = /(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+(?:com|org|net|edu|gov|io|co|tv|be)(?:\b|\/)/i;
  const creditHeading = /(?:^|[\n|•·])\s*(?:#{1,6}\s*)?(?:source[s]?|references?|kaynak(?:lar|ça)?|fuentes?|referencias?|credits?|créditos?|kapak fotoğrafları|cover photography|fotografías de portada|görsel kaynağı|görüntü(?:ler)?|fotoğrafçı|photographer|fotógraf[oa])\s*(?:[:|•·–—]|$)/imu;
  const archiveStamp = /(?:^|[\n|•·])\s*[#\[]?(?:arşiv(?: görüntüsü| fotoğrafı)?|archive(?: footage| photo)?|archivo|imagen de archivo|imágenes de archivo)\s*(?:[\]:|•·–—-]|$)/imu;
  const datedArchive = /(?:^|[\n|•·])\s*(?:\d{1,2}\s+)?(?:\p{L}+\s+)?(?:19|20)\d{2}\s+arşivi\s*(?:$|[|•·])/imu;
  const attribution = /(?:\b(?:photo(?:graphy)?\s+(?:by|credit)|images? courtesy of|footage courtesy of|courtesy of|crédito(?:s)? de (?:foto|imagen)|foto(?:ğraf)?\s*:)|(?:^|\s)©\s*\S|\bCC[ -]BY(?:[ -]SA)?\s+\d)/iu;
  const sourceTag = /(?:^|\s)#(?:gettyimages|wikimediacommons|fotocredito|photocredit|arsivgoruntusu|arşivgörüntüsü|archivefootage|imagendearchivo)(?=\s|$)/iu;
  const sourceByline = /^\s*(?:Getty Images|Wikimedia Commons|WikiPortraits|AP Photo)\s*(?:$|[|•·/])/imu;
  return datedArchive.test(text) || sourceTag.test(text) || sourceByline.test(text) || sourceUrl.test(text) || creditHeading.test(text) || archiveStamp.test(text) || attribution.test(text);
}

function hasPublicCreditPlacement(credit) {
  if (credit?.verified !== true) return false;
  if (!URL.canParse(credit.url)) return false;
  const url = new URL(credit.url);
  const host = url.hostname.toLowerCase();
  return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
    && host.includes('.') && !host.endsWith('.local') && !host.endsWith('.localhost')
    && !/^(?:127\.|10\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host);
}

async function safeFile(root, relative) {
  demand(typeof relative === 'string' && relative.length > 0 && !path.isAbsolute(relative) && !relative.includes('\\') && relative.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe episode-relative file path.');
  let filename = root;
  const parts = relative.split('/');
  for (let index = 0; index < parts.length; index++) {
    filename = path.join(filename, parts[index]);
    const stat = await fs.lstat(filename);
    demand(!stat.isSymbolicLink() && (index === parts.length - 1 ? stat.isFile() : stat.isDirectory()), `Not a regular episode file: ${relative}`);
  }
  const content = await fs.readFile(filename);
  return {path: relative, filename, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex'), content};
}

function reviewChecks(evidence, hashes, lang) {
  return [hashes.master_tr, hashes[`youtube_dub_${lang}_wav`], hashes[`youtube_dub_${lang}_mp3`]].every(hash => SHA.test(hash ?? '')) &&
    evidence?.schema_version === 1 && evidence.kind === 'youtube_dub_alignment' && evidence.language === lang &&
    evidence.status === 'PASS' && evidence.master_sha256 === hashes.master_tr &&
    evidence.wav_sha256 === hashes[`youtube_dub_${lang}_wav`] && evidence.mp3_sha256 === hashes[`youtube_dub_${lang}_mp3`] &&
    evidence.timeline_start_seconds === 0 && evidence.full_master_including_closure === true &&
    evidence.time_stretched === false && evidence.speed_factor === 1 && evidence.auto_trimmed === false &&
    evidence.silence_policy === 'preserve_or_insert';
}

/** Probe injection is for tests; the CLI always uses the real ffprobe adapter. */
export async function evaluateDelivery(episodePath, {probe = probeMedia, now = () => new Date().toISOString(), regenerateReport = false} = {}) {
  const checks = Object.fromEntries(['DUB_DURATION_GATE', 'TIMELINE_GATE', 'AUDIO_POLICY_GATE', 'SEMANTIC_GATE', 'REQUIRED_FILES_GATE', 'FILE_INTEGRITY_GATE'].map(name => [name, gate()]));
  const report = {schema_version: 1, scope: 'automated_delivery_gates_only', status: 'FAIL', checked_at: now(), episode_path: path.resolve(episodePath), checks, media: {}, limitations: ['Automated PASS is not a human audition, artwork approval or publication readiness decision.', 'Semantic meaning, cumulative visual sync, closure content and silence/speed policy require separate hash-bound review evidence; duration equality does not establish them.']};
  const errors = name => checks[name].errors;
  let root, manifest, validateAssets;
  try {
    const stat = await fs.lstat(report.episode_path);
    demand(stat.isDirectory() && !stat.isSymbolicLink(), 'Episode path must be a real directory.');
    root = await fs.realpath(report.episode_path);
    manifest = JSON.parse((await safeFile(root, '08_delivery/manifest.json')).content.toString('utf8'));
    const schema = JSON.parse(await fs.readFile(path.join(ROOT, 'brand/bay-referee/production-template/manifest.schema.json'), 'utf8'));
    const ajv = new Ajv2020({allErrors: true, strict: false});
    ajv.addFormat('date-time', dateTime);
    const assetSchema = JSON.parse(await fs.readFile(path.join(ROOT, 'brand/bay-referee/production-template/asset-manifest.schema.json'), 'utf8'));
    validateAssets = ajv.compile(assetSchema);
    const validate = ajv.compile(schema);
    if (!validate(manifest)) errors('REQUIRED_FILES_GATE').push(...validate.errors.map(error => `Manifest schema ${error.instancePath}: ${error.message}`));
    demand(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug ?? ''), 'Missing/invalid manifest slug.');
  } catch (error) {
    for (const check of Object.values(checks)) { check.status = 'FAIL'; check.errors.push(`Cannot evaluate package: ${error.message}`); }
    return report;
  }
  const minimum = minimumFiles(manifest.slug);
  const expected = {...Object.fromEntries(Object.entries(manifest.files ?? {}).filter(([key, file]) => key !== 'qa_report' && file.required === true).map(([key, file]) => [key, file.path])), ...minimum};
  const loaded = {}, hashes = {};
  for (const [key, relative] of Object.entries(expected)) {
    const record = manifest.files?.[key];
    if (!record || record.path !== relative || record.required !== true) errors('REQUIRED_FILES_GATE').push(`${key}: required manifest record/path missing or incorrect (${relative}).`);
    try {
      const file = await safeFile(root, relative);
      loaded[key] = file; hashes[key] = file.sha256;
      if (file.bytes === 0 && (record?.content_required !== false || Object.hasOwn(minimum, key))) errors('REQUIRED_FILES_GATE').push(`${key}: file is empty.`);
      if (['text', 'captions'].includes(record?.kind) && record.content_required !== false && !file.content.toString('utf8').trim()) errors('REQUIRED_FILES_GATE').push(`${key}: text content is blank.`);
      if (['text', 'captions'].includes(record?.kind)) {
        const text = file.content.toString('utf8');
        if (/\{\{[^}]+\}\}|\b(?:TBD|PLACEHOLDER|INSERT (?:TITLE|TEXT|DESCRIPTION) HERE)\b/i.test(text) || /^\s*TODO(?:\s*:|\s*$)/m.test(text)) errors('REQUIRED_FILES_GATE').push(`${key}: nonfinal placeholder text.`);
      }
      if (['cover_tr', 'cover_en', 'cover_es'].includes(key)) {
        try {
          const image = await sharp(file.content).metadata();
          demand(image.format === 'png' && image.width === 1080 && image.height === 1920, 'Cover must be an actual 1080×1920 PNG.');
        } catch (error) { errors('REQUIRED_FILES_GATE').push(`${key}: ${error.message}`); }
      }
      if (record?.status !== 'GENERATED' || !SHA.test(record?.sha256 ?? '') || record.sha256 !== file.sha256 || record.bytes !== file.bytes) errors('FILE_INTEGRITY_GATE').push(`${key}: generated status, byte count or SHA-256 is missing/stale.`);
    } catch (error) { errors('REQUIRED_FILES_GATE').push(`${key}: ${error.message}`); }
  }
  const assetCredits = new Set();
  if (loaded.asset_manifest) {
    try {
      const provenance = JSON.parse(loaded.asset_manifest.content.toString('utf8'));
      if (!validateAssets(provenance)) {
        throw new Error(validateAssets.errors.map(error => `${error.instancePath} ${error.message}`).join(', '));
      }
      const used = provenance.assets.filter(asset => asset.used_in?.length !== 0);
      demand(used.length > 0, 'No used assets documented for the delivered cut.');
      const reviewOnly = [];
      const pendingCredit = [];
      for (const asset of used) {
        const {status, attribution_required, attribution, public_credit} = asset.rights;
        if (attribution_required) {
          assetCredits.add(attribution.trim().toLowerCase());
          if (!hasPublicCreditPlacement(public_credit)) pendingCredit.push(asset.id);
        }
        if (status === 'REVIEW' || status === 'REVIEW_NEEDED') {
          reviewOnly.push(asset.id);
        }
      }
      report.asset_rights = {
        used_assets: used.length, review_only: reviewOnly, pending_public_credit: pendingCredit,
        release_basis: reviewOnly.length || pendingCredit.length ? 'REVIEW' : 'APPROVED',
      };
      if (manifest.status === 'READY' && pendingCredit.length) {
        errors('REQUIRED_FILES_GATE').push(`READY requires a verified separate public credit placement for: ${pendingCredit.join(', ')}.`);
      }
      if (manifest.status === 'READY' && reviewOnly.length) {
        errors('REQUIRED_FILES_GATE').push(`READY requires publication rights for assets present in this cut: ${reviewOnly.join(', ')}.`);
      }
    } catch (error) {
      errors('REQUIRED_FILES_GATE').push(`asset_manifest: ${error.message}`);
    }
  }
  const includesCredit = copy => [...assetCredits].some(credit =>
    copy.split(/\r?\n/).some(line => line.trim().toLowerCase() === credit)
  );
  const viewerCopy = ['cover_title', 'youtube_tags'];
  for (const lang of ['tr', ...LANGUAGES]) {
    for (const kind of ['title', 'description', 'hashtags', 'captions']) viewerCopy.push(`${kind}_${lang}`);
  }
  for (const key of viewerCopy) {
    if (!loaded[key]) continue;
    const copy = loaded[key].content.toString('utf8');
    if (hasSourceLabel(copy) || includesCredit(copy)) {
      errors('REQUIRED_FILES_GATE').push(`${key}: move added source labels, links or asset credits outside viewer copy.`);
    }
  }
  // Daily picture builds keep their actual overlays here. Older episodes can
  // use a different storyboard; their rendered picture still needs inspection.
  try {
    const file = await safeFile(root, '_work/picture/timeline.json');
    hashes.picture_timeline = file.sha256;
    const timeline = JSON.parse(file.content.toString('utf8'));
    for (const [index, shot] of (timeline.shots ?? []).entries()) {
      for (const key of ['title', 'caption']) {
        const copy = shot[key];
        if (typeof copy === 'string' && (hasSourceLabel(copy) || includesCredit(copy))) {
          errors('REQUIRED_FILES_GATE').push(`picture_timeline: shot ${index + 1} ${key} includes an added source label.`);
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') errors('REQUIRED_FILES_GATE').push(`picture_timeline: ${error.message}`);
  }
  const keys = ['master_tr', ...LANGUAGES.flatMap(lang => ['wav', 'mp3'].map(ext => `youtube_dub_${lang}_${ext}`))];
  for (const key of keys) {
    try {
      demand(loaded[key], `${key} is missing.`);
      report.media[key] = {...await probe(loaded[key].filename), path: loaded[key].path, sha256: loaded[key].sha256};
      const after = await safeFile(root, loaded[key].path);
      demand(after.sha256 === loaded[key].sha256, `${key} changed while being probed.`);
    } catch (error) {
      delete report.media[key];
      errors('DUB_DURATION_GATE').push(`${key}: ${error.message}`);
      errors('TIMELINE_GATE').push(`${key}: no valid presentation timeline.`);
    }
  }
  checks.DUB_DURATION_GATE.comparisons = {};
  for (const key of keys.slice(1)) {
    const comparison = evaluateDubDuration(report.media.master_tr?.duration_seconds, report.media[key]?.duration_seconds);
    checks.DUB_DURATION_GATE.comparisons[key] = comparison;
    if (comparison.status !== 'PASS') errors('DUB_DURATION_GATE').push(`${key}: ${comparison.errors.join(' ')}`);
  }
  for (const [key, media] of Object.entries(report.media)) {
    if (!finite(media.start_seconds) || !finite(media.zero_start_tolerance_seconds) || Math.abs(media.start_seconds) > media.zero_start_tolerance_seconds) errors('TIMELINE_GATE').push(`${key}: presentation timeline must start at zero.`);
  }
  for (const lang of LANGUAGES) {
    if (!SHA.test(hashes[`youtube_dub_${lang}_wav`] ?? '') || manifest.caption_timing?.[lang]?.authority?.audio_sha256 !== hashes[`youtube_dub_${lang}_wav`]) errors('TIMELINE_GATE').push(`${lang}: caption timing authority is not bound to the current final WAV hash.`);
    try {
      const evidence = JSON.parse(loaded[`alignment_${lang}`]?.content.toString('utf8') ?? 'null');
      demand(reviewChecks(evidence, hashes, lang), 'Missing/stale alignment evidence, closure coverage, zero origin, or preserve-silence/no-speed-change review.');
    } catch (error) { errors('AUDIO_POLICY_GATE').push(`${lang}: ${error.message}`); }
  }
  try {
    const evidence = JSON.parse(loaded.semantic_sync?.content.toString('utf8') ?? 'null');
    demand(evidence?.schema_version === 1 && evidence.master_sha256 === hashes.master_tr && SHA.test(hashes.master_tr ?? ''), 'Missing/stale semantic review master hash.');
    for (const lang of LANGUAGES) {
      const review = evidence.languages?.[lang];
      demand(review && review.status === 'PASS' && review.wav_sha256 === hashes[`youtube_dub_${lang}_wav`] && review.mp3_sha256 === hashes[`youtube_dub_${lang}_mp3`] && SHA.test(review.wav_sha256 ?? '') && SHA.test(review.mp3_sha256 ?? ''), `${lang}: semantic review is missing or bound to other audio.`);
      demand(['meaning_preserved', 'clause_order_preserved', 'cumulative_sync_reviewed', 'closure_covered'].every(key => review[key] === true) && typeof review.reviewed_by === 'string' && review.reviewed_by.trim() && dateTime(review.reviewed_at), `${lang}: semantic/cumulative sync review is incomplete.`);
    }
  } catch (error) { errors('SEMANTIC_GATE').push(error.message); }
  if (manifest.status === 'READY' && !regenerateReport) {
    try {
      const record = manifest.files?.qa_report;
      const stored = await safeFile(root, '08_delivery/qa-report.json');
      demand(record?.path === stored.path && record.status === 'GENERATED' && record.sha256 === stored.sha256 && record.bytes === stored.bytes, 'Stored READY report hash/byte record is stale.');
      const previous = JSON.parse(stored.content.toString('utf8'));
      demand(previous.schema_version === 1 && previous.status === 'PASS' && Object.keys(checks).every(name => previous.checks?.[name]?.status === 'PASS'), 'Stored READY report did not pass every gate.');
      demand(previous.file_hashes && Object.keys(previous.file_hashes).length === Object.keys(hashes).length && Object.entries(hashes).every(([key, sha]) => previous.file_hashes[key] === sha), 'Stored READY report is bound to different input hashes.');
    } catch (error) { errors('FILE_INTEGRITY_GATE').push(`READY qa_report: ${error.message}`); }
  }
  const recorded = names => names.every(name => manifest.qa?.checks?.[name] === 'PASS') ? 'RECORDED_PASS' : 'UNVERIFIED';
  report.manual_reviews = {
    cover_same_art_and_safe_area: recorded(['cover']),
    semantic_caption_alignment: recorded(['captions']),
    full_audio_audition: recorded(['voice', 'dub', 'sfx']),
    natural_localized_seo_and_source_name_placement: 'UNVERIFIED',
  };
  for (const check of Object.values(checks)) check.status = check.errors.length ? 'FAIL' : 'PASS';
  report.status = Object.values(checks).every(check => check.status === 'PASS') ? 'PASS' : 'FAIL';
  report.file_hashes = hashes;
  return report;
}
