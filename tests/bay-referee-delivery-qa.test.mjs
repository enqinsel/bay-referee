import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {evaluateDubDuration, audioPresentation, masterPresentation, probeMedia, evaluateDelivery} from '../engine/bay-referee/delivery-qa.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(project, 'scripts/bay-referee-delivery-qa.mjs');
const date = '2026-10-21T12:00:00.000Z';
const hash = content => createHash('sha256').update(content).digest('hex');
const measured = duration => ({duration_seconds: duration, start_seconds: 0, zero_start_tolerance_seconds: 0.000001, duration_basis: 'test_probe'});

test('DUB_DURATION_GATE includes both exact 50 ms boundaries but rejects larger differences', () => {
  for (const master of [1, 57.833333, 300]) {
    for (const offset of [-0.05, 0, 0.05]) assert.equal(evaluateDubDuration(master, master + offset).status, 'PASS');
    for (const offset of [-0.05000001, 0.05000001, -1, 1]) assert.equal(evaluateDubDuration(master, master + offset).status, 'FAIL');
  }
  for (const value of [undefined, null, '58', NaN, Infinity, -Infinity, 0, -1]) {
    assert.equal(evaluateDubDuration(value, 58).status, 'FAIL');
    assert.equal(evaluateDubDuration(58, value).status, 'FAIL');
  }
});

function audio(codec = 'mp3', duration = '999') {
  return {streams: [{index: 0, codec_type: 'audio', codec_name: codec, sample_rate: '48000'}], format: {duration, start_time: '0'}};
}
function frame(samples = 48000, time = 0) {
  return {media_type: 'audio', stream_index: 0, nb_samples: samples, best_effort_timestamp_time: String(time)};
}
test('audio duration uses decoded samples, preserving silent samples instead of container duration claims', () => {
  const actual = audioPresentation(audio('pcm_s16le'), {frames: [frame(), frame(48000, 1)]}, '.wav');
  assert.equal(actual.duration_seconds, 2);
  assert.equal(actual.container_duration_seconds, 999);
  assert.equal(actual.start_seconds, 0);
  assert.equal(actual.decoded_samples, 96000);
});

test('MP3 encoder priming has explicit packet evidence and does not enlarge the duration tolerance', () => {
  const priming = 1105 / 48000;
  const parsed = audioPresentation(audio(), {
    packets_and_frames: [
      {type: 'packet', pts_time: '0', side_data_list: [{side_data_type: 'Skip Samples', skip_samples: 1105}]},
      {type: 'frame', ...frame(48000, priming)},
    ],
  }, '.mp3');
  assert.equal(parsed.duration_seconds, 1);
  assert.equal(parsed.start_seconds, 0);
  assert.equal(parsed.encoder_priming_samples, 1105);
  const unproven = audioPresentation(audio(), {frames: [frame(48000, priming)]}, '.mp3');
  assert(unproven.start_seconds > unproven.zero_start_tolerance_seconds);
  assert.throws(() => audioPresentation(audio(), {frames: [frame()], packets: [{pts_time: '0', side_data_list: [{skip_samples: 1105}]}]}, '.mp3'), /priming/);
});

test('wrong streams, codecs, absent samples, nonfinite metadata and discontinuities fail closed', () => {
  for (const invalid of [
    {streams: []},
    {...audio(), streams: [...audio().streams, {codec_type: 'video'}]},
    {...audio(), streams: [{...audio().streams[0], sample_rate: 'NaN'}]},
    audio('aac'),
  ]) assert.throws(() => audioPresentation(invalid, {frames: [frame()]}, '.mp3'));
  for (const invalid of [{frames: []}, {frames: [frame(NaN)]}, {frames: [frame(48000, NaN)]}, {frames: [frame(), frame(48000, 1.01)]}]) assert.throws(() => audioPresentation(audio(), invalid, '.mp3'));
  const master = {streams: [{codec_type: 'video', start_time: '0', duration: '57.9'}, {codec_type: 'audio'}], format: {format_name: 'mov,mp4,m4a,3gp,3g2,mj2', duration: '58', start_time: '0'}};
  assert.equal(masterPresentation(master).duration_seconds, 58, 'Full master container includes ending audio/closure, not shortest video stream.');
  assert.throws(() => masterPresentation({...master, format: {...master.format, duration: 'NaN'}}));
  assert.throws(() => masterPresentation({...master, streams: master.streams.slice(0, 1)}));
});

test('real ffprobe adapter treats execution errors, decoder diagnostics and malformed JSON as failures', () => {
  for (const response of [{status: 1, stderr: 'bad media'}, {error: new Error('missing ffprobe')}, {status: 0, stderr: 'decode failure', stdout: '{}'}, {status: 0, stderr: '', stdout: 'bad json'}]) {
    assert.throws(() => probeMedia('/fixture/no-media.wav', {ffprobePath: '/mock/ffprobe', run: () => response}), /ffprobe/);
  }
  let calls = 0;
  const result = probeMedia('/fixture/no-media.wav', {ffprobePath: '/mock/ffprobe', run: (_binary, args) => {
    assert.equal(args.at(-1), '/fixture/no-media.wav');
    return {status: 0, stderr: '', stdout: JSON.stringify(calls++ === 0 ? audio('pcm_s16le') : {frames: [frame()]})};
  }});
  assert.equal(calls, 2);
  assert.equal(result.duration_seconds, 1);
});

/** No production media or audio/video is made. Small deterministic PNGs exercise real image metadata. */
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bay-referee-delivery-qa-'));
  t.after(() => fs.rm(root, {recursive: true, force: true}));
  const raw = await fs.readFile(path.join(project, 'brand/bay-referee/production-template/files/08_delivery/manifest.json'), 'utf8');
  const manifest = JSON.parse(raw.replaceAll('{{slug}}', 'qa-fixture').replaceAll('{{created_at}}', date));
  manifest.status = 'IN_PROGRESS';
  async function put(key, content) {
    const record = manifest.files[key];
    assert(record, `Expected template record: ${key}`);
    const data = typeof content === 'string' || Buffer.isBuffer(content) ? content : JSON.stringify(content);
    const filename = path.join(root, record.path);
    await fs.mkdir(path.dirname(filename), {recursive: true});
    await fs.writeFile(filename, data);
    Object.assign(record, {status: 'GENERATED', sha256: hash(data), bytes: Buffer.byteLength(data), generated_at: date});
  }
  for (const key of Object.keys(manifest.files)) if (key !== 'qa_report') await put(key, `inert test fixture ${key}`);
  const png = await sharp({create: {width: 1080, height: 1920, channels: 3, background: 'white'}}).png().toBuffer();
  for (const lang of ['tr', 'en', 'es']) await put(`cover_${lang}`, png);
  const semantic = {schema_version: 1, master_sha256: manifest.files.master_tr.sha256, languages: {}};
  for (const lang of ['en', 'es']) {
    const common = {wav_sha256: manifest.files[`youtube_dub_${lang}_wav`].sha256, mp3_sha256: manifest.files[`youtube_dub_${lang}_mp3`].sha256};
    await put(`alignment_${lang}`, {schema_version: 1, kind: 'youtube_dub_alignment', language: lang, master_sha256: semantic.master_sha256, ...common, timeline_start_seconds: 0, full_master_including_closure: true, time_stretched: false, speed_factor: 1, auto_trimmed: false, silence_policy: 'preserve_or_insert', status: 'PASS'});
    semantic.languages[lang] = {...common, meaning_preserved: true, clause_order_preserved: true, cumulative_sync_reviewed: true, closure_covered: true, status: 'PASS', reviewed_by: 'test reviewer', reviewed_at: date};
    manifest.caption_timing[lang].authority.audio_sha256 = common.wav_sha256;
  }
  await put('semantic_sync', semantic);
  const save = () => fs.writeFile(path.join(root, '08_delivery/manifest.json'), JSON.stringify(manifest));
  await save();
  return {root, manifest, put, save, semantic};
}

test('independent complete evidence passes; QA output is not a circular input prerequisite', async t => {
  const f = await fixture(t);
  const before = await fs.readFile(path.join(f.root, '08_delivery/manifest.json'));
  let count = 0;
  const report = await evaluateDelivery(f.root, {probe: () => { count++; return measured(58); }, now: () => date});
  assert.equal(report.status, 'PASS', JSON.stringify(report.checks));
  assert.equal(count, 5);
  assert.equal(report.checks.DUB_DURATION_GATE.status, 'PASS');
  await assert.rejects(fs.stat(path.join(f.root, '08_delivery/qa-report.json')), {code: 'ENOENT'});
  assert.deepEqual(await fs.readFile(path.join(f.root, '08_delivery/manifest.json')), before);
});

test('manifest duration/PASS claims cannot bypass measured mismatch or semantic review', async t => {
  const f = await fixture(t);
  f.manifest.video.duration_seconds = 58;
  f.manifest.audio_packages.en.duration_seconds = {wav: 58, mp3: 58};
  f.manifest.qa.checks.DUB_DURATION_GATE = 'PASS';
  await f.save();
  const badDuration = await evaluateDelivery(f.root, {probe: file => measured(file.endsWith('youtube-dub-en.mp3') ? 58.051 : 58)});
  assert.equal(badDuration.checks.DUB_DURATION_GATE.status, 'FAIL');
  assert.equal(badDuration.status, 'FAIL');
  f.semantic.languages.es.cumulative_sync_reviewed = false;
  await f.put('semantic_sync', f.semantic); await f.save();
  const semanticFail = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert.equal(semanticFail.checks.DUB_DURATION_GATE.status, 'PASS');
  assert.equal(semanticFail.checks.SEMANTIC_GATE.status, 'FAIL');
  assert.equal(semanticFail.status, 'FAIL');
});

test('stale hashes, missing required files and missing MP3 all block readiness', async t => {
  const f = await fixture(t);
  await fs.appendFile(path.join(f.root, f.manifest.files.cover_en.path), 'changed');
  await fs.rm(path.join(f.root, f.manifest.files.youtube_dub_es_mp3.path));
  delete f.manifest.files.title_es;
  await f.save();
  const report = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert.equal(report.status, 'FAIL');
  assert.equal(report.checks.FILE_INTEGRITY_GATE.status, 'FAIL');
  assert.equal(report.checks.REQUIRED_FILES_GATE.status, 'FAIL');
  assert.equal(report.checks.DUB_DURATION_GATE.status, 'FAIL');
  assert(report.checks.REQUIRED_FILES_GATE.errors.some(error => error.includes('title_es')));
});

test('positive presentation offset, unreviewed trimming and stale semantic binding fail separately', async t => {
  const f = await fixture(t);
  const alignment = JSON.parse(await fs.readFile(path.join(f.root, f.manifest.files.alignment_en.path), 'utf8'));
  alignment.auto_trimmed = true;
  await f.put('alignment_en', alignment);
  f.semantic.languages.en.wav_sha256 = 'a'.repeat(64);
  await f.put('semantic_sync', f.semantic); await f.save();
  const report = await evaluateDelivery(f.root, {probe: file => ({...measured(58), start_seconds: file.endsWith('.mp3') ? 0.01 : 0})});
  assert.equal(report.checks.DUB_DURATION_GATE.status, 'PASS');
  for (const name of ['TIMELINE_GATE', 'AUDIO_POLICY_GATE', 'SEMANTIC_GATE']) assert.equal(report.checks[name].status, 'FAIL');
});

test('cover dimensions, nonfinal text, public source headings/URLs and stale caption authority fail', async t => {
  const f = await fixture(t);
  await f.put('cover_es', await sharp({create: {width: 1280, height: 720, channels: 3, background: 'white'}}).png().toBuffer());
  await f.put('title_en', 'PLACEHOLDER title');
  await f.put('description_en', 'Sources:\nIFAB https://example.org/rules');
  f.manifest.caption_timing.es.authority.audio_sha256 = f.manifest.files.audio_es_wav.sha256;
  await f.save();
  const report = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert.equal(report.checks.DUB_DURATION_GATE.status, 'PASS');
  assert.equal(report.checks.REQUIRED_FILES_GATE.status, 'FAIL');
  for (const key of ['cover_es', 'title_en', 'description_en']) assert(report.checks.REQUIRED_FILES_GATE.errors.some(error => error.startsWith(key)));
  assert.equal(report.checks.TIMELINE_GATE.status, 'FAIL');
  assert(report.checks.TIMELINE_GATE.errors.some(error => error.includes('caption timing authority')));
  assert.equal(report.scope, 'automated_delivery_gates_only');
  assert.equal(report.manual_reviews.full_audio_audition, 'UNVERIFIED');
});

test('a verified photo credit can accompany a description while unrelated URLs still fail', async t => {
  const f = await fixture(t);
  const credit = 'Photo by P. Silva. CC BY 4.0 https://creativecommons.org/licenses/by/4.0/';
  await f.put('asset_manifest', {assets: [{rights: {status: 'VERIFIED', attribution_required: true, attribution: credit}}]});
  await f.put('description_en', 'How did Belgium approach the free kick?\n\nCover photography\nPhoto by P. Silva. Cropped. https://creativecommons.org/licenses/by/4.0/');
  await f.put('description_es', 'Más en https://example.com/reportaje\n\n' + credit);
  await f.put('description_tr', credit);
  await f.save();
  const report = await evaluateDelivery(f.root, {probe: () => measured(58)});
  const errors = report.checks.REQUIRED_FILES_GATE.errors;
  assert(!errors.some(error => error.startsWith('description_en:')));
  assert(errors.some(error => error.startsWith('description_es:')));
  assert(errors.some(error => error.startsWith('description_tr:')));
  await f.put('description_en', 'How did Belgium approach the free kick?\n\nCover photography\nPhoto by P. Silva. https://unrelated.example.com/');
  await f.save();
  const other = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert(other.checks.REQUIRED_FILES_GATE.errors.some(error => error.startsWith('description_en:')));
});

test('READY read-only run requires a current stored PASS report; explicit regeneration has no circular dependency', async t => {
  const f = await fixture(t);
  const base = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert.equal(base.status, 'PASS');
  f.manifest.status = 'READY'; await f.save();
  const missing = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert(missing.checks.FILE_INTEGRITY_GATE.errors.some(error => error.startsWith('READY qa_report:')));
  await f.put('qa_report', base); await f.save();
  const bound = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert(!bound.checks.FILE_INTEGRITY_GATE.errors.some(error => error.startsWith('READY qa_report:')));
  await f.put('description_tr', 'Changed final description'); await f.save();
  const stale = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert(stale.checks.FILE_INTEGRITY_GATE.errors.some(error => error.includes('different input hashes')));
  const regeneration = await evaluateDelivery(f.root, {probe: () => measured(58), regenerateReport: true});
  assert(!regeneration.checks.FILE_INTEGRITY_GATE.errors.some(error => error.startsWith('READY qa_report:')));
  await fs.appendFile(path.join(f.root, '08_delivery/qa-report.json'), ' ');
  const changed = await evaluateDelivery(f.root, {probe: () => measured(58)});
  assert(changed.checks.FILE_INTEGRITY_GATE.errors.some(error => error.includes('hash/byte record is stale')));
});

test('probe failures, nonfinite observations and a media mutation during probing fail closed', async t => {
  const f = await fixture(t);
  const report = await evaluateDelivery(f.root, {probe: async file => {
    if (file.endsWith('.mp4')) return measured(NaN);
    if (file.endsWith('youtube-dub-en.wav')) throw new Error('decoder failed');
    if (file.endsWith('youtube-dub-es.wav')) await fs.appendFile(file, 'changed during probe');
    return measured(58);
  }});
  assert.equal(report.status, 'FAIL');
  assert.equal(report.checks.DUB_DURATION_GATE.status, 'FAIL');
  assert(report.checks.DUB_DURATION_GATE.errors.some(error => error.includes('changed while')));
});

test('CLI defaults to read-only JSON, returns failure exit, and writes only on explicit --output', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bay-referee-cli-'));
  t.after(() => fs.rm(root, {recursive: true, force: true}));
  await fs.mkdir(path.join(root, '08_delivery'));
  await fs.writeFile(path.join(root, '08_delivery/manifest.json'), '{bad json');
  const run = args => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8'});
  const result = run([root]);
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, 'FAIL');
  await assert.rejects(fs.stat(path.join(root, '08_delivery/qa-report.json')), {code: 'ENOENT'});
  assert.equal(run([root, '--output']).status, 1);
  assert.equal(JSON.parse(await fs.readFile(path.join(root, '08_delivery/qa-report.json'), 'utf8')).status, 'FAIL');
  assert.equal(run(['--help']).status, 0);
  assert.equal(run([root, '--bogus']).status, 2);
});
