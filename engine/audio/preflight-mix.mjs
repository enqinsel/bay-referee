/** Audition and relative-level A/B experiments. Original media is read only.
 * Unlike the V3 safety mix, these prototypes may boost a cue and apply one
 * common headroom gain to voice and effects. No compressor or limiter is used.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { signalMetrics, writeFloatWav, sha256File } from './mix-sfx.mjs';
export { signalMetrics, writeFloatWav, sha256File };
export const linear = db => 10 ** (db / 20);
export const decibels = value => value > 0 ? 20 * Math.log10(value) : -Infinity;

export function audioCommand(command, args) {
  const r = spawnSync(command, args, { maxBuffer: 128 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw Error(r.error?.message || r.stderr?.toString());
  return r;
}
export function decodeMono(file, ffmpeg, { sampleRate, native = false } = {}) {
  const args = ['-v', 'error', '-i', file, '-map', '0:a:0', '-vn'];
  if (!native) args.push('-ac', '1', '-ar', String(sampleRate));
  args.push('-c:a', 'pcm_f32le', '-f', 'f32le', 'pipe:1');
  const raw = audioCommand(ffmpeg, args).stdout;
  if (!raw.length || raw.length % 4) throw Error('Empty or malformed decoded PCM');
  return new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
}
export function activeRange(samples, { floorDbfs = -50, relativeFloorDb = -40 } = {}) {
  const peak = signalMetrics(samples).peak;
  if (!peak) throw Error('Silent effect');
  const threshold = Math.max(linear(floorDbfs), peak * linear(relativeFloorDb));
  let start = 0, end = samples.length;
  while (start < end && Math.abs(samples[start]) < threshold) start++;
  while (end > start && Math.abs(samples[end - 1]) < threshold) end--;
  if (start === end) throw Error('Effect below active-signal threshold');
  return { start, end, threshold_dbfs: decibels(threshold) };
}
export function prepareEffect(samples, sampleRate, { maxSeconds = 3, fadeInSeconds = .005, fadeOutSeconds = .045 } = {}) {
  if (!(sampleRate > 0 && maxSeconds > 0 && fadeInSeconds >= 0 && fadeOutSeconds >= 0)) throw Error('Invalid effect parameters');
  const active = activeRange(samples);
  const start = Math.max(0, active.start - Math.round(.02 * sampleRate));
  const end = Math.min(samples.length, active.end + Math.round(.06 * sampleRate), start + Math.round(maxSeconds * sampleRate));
  const shaped = samples.slice(start, end);
  const fadeIn = Math.round(fadeInSeconds * sampleRate), fadeOut = Math.round(fadeOutSeconds * sampleRate);
  if (fadeIn + fadeOut > shaped.length) throw Error('Fades exceed effect duration');
  for (let i = 0; i < shaped.length; i++) {
    const attack = fadeIn > 1 ? Math.min(1, i / (fadeIn - 1)) : 1;
    const release = fadeOut > 1 ? Math.min(1, (shaped.length - 1 - i) / (fadeOut - 1)) : 1;
    shaped[i] *= Math.max(0, Math.min(attack, release));
  }
  return { samples: shaped, active: activeRange(shaped), source_start_sample: start, source_end_sample: end, fade_in_seconds: fadeInSeconds, fade_out_seconds: fadeOutSeconds };
}
export function normalizeAudition(prepared, { activeRmsDbfs = -20, peakCapDbfs = -3 } = {}) {
  const { samples, active } = prepared;
  if (!Number.isFinite(activeRmsDbfs) || !Number.isFinite(peakCapDbfs) || peakCapDbfs > -1.5) throw Error('Invalid audition level');
  const rms = signalMetrics(samples.subarray(active.start, active.end)).rms;
  const gain = Math.min(linear(activeRmsDbfs) / rms, linear(peakCapDbfs) / signalMetrics(samples).peak);
  const result = Float32Array.from(samples, value => value * gain);
  return { samples: result, gain, gain_db: decibels(gain), active_rms_dbfs: signalMetrics(result.subarray(active.start, active.end)).rms_dbfs, metrics: signalMetrics(result) };
}
export function exactVoiceExcerpt(voice, startSeconds, endSeconds, sampleRate) {
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds) || startSeconds < 0 || endSeconds <= startSeconds) throw Error('Invalid voice excerpt');
  const start = Math.round(startSeconds * sampleRate), end = Math.round(endSeconds * sampleRate);
  if (end > voice.length) throw Error('Excerpt exceeds voice authority');
  return { samples: voice.slice(start, end), source_start_sample: start, source_end_sample: end };
}
export function mixRelative(voice, cues, { sampleRate = 44100, marginDb = 17 } = {}) {
  if (!Number.isFinite(marginDb) || marginDb <= 0) throw Error('Narration margin must be finite and positive');
  const bed = new Float32Array(voice.length), reports = [], occupied = [];
  for (const cue of cues) {
    const cueMargin = cue.margin_db ?? marginDb;
    if (!Number.isFinite(cueMargin) || cueMargin <= 0) throw Error('Cue narration margin must be finite and positive');
    if (!cue.id || !Number.isFinite(cue.time) || cue.time < 0 || reports.some(r => r.id === cue.id)) throw Error('Invalid or duplicate cue');
    const source = cue.prepared.samples, active = cue.prepared.active;
    const start = Math.round(cue.time * sampleRate), end = start + source.length;
    if (end > voice.length) throw Error(`Cue ${cue.id} exceeds excerpt`);
    if (occupied.some(([a, b]) => start < b && end > a)) throw Error(`Overlapping cue ${cue.id}`);
    occupied.push([start, end]);
    const concurrent = signalMetrics(voice.subarray(start + active.start, start + active.end));
    let authority = concurrent, fallback = null;
    if (authority.rms_dbfs < -50) {
      authority = signalMetrics(voice.subarray(Math.max(0, start - sampleRate / 2), Math.min(voice.length, end + sampleRate / 2)));
      fallback = 'Concurrent active effect window below -50 dBFS; use surrounding ±0.5 seconds of narration.';
      if (authority.rms_dbfs < -50) { authority = signalMetrics(voice); fallback += ' Surrounding voice also silent; use excerpt RMS.'; }
    }
    if (authority.rms_dbfs < -50) throw Error('No narration authority for relative mix');
    const sourceMetrics = signalMetrics(source.subarray(active.start, active.end));
    const gain = authority.rms * linear(-cueMargin) / sourceMetrics.rms;
    for (let i = 0; i < source.length; i++) bed[start + i] += source[i] * gain;
    const result = signalMetrics(bed.subarray(start + active.start, start + active.end));
    reports.push({ id: cue.id, audition_id: cue.audition_id, asset_id: cue.asset_id, category: cue.category, at_seconds: start / sampleRate, duration_seconds: source.length / sampleRate, start_sample: start, end_sample: end, active_start_sample: start + active.start, active_end_sample: start + active.end, active_sfx_rms_dbfs: result.rms_dbfs, concurrent_voice_rms_dbfs: concurrent.rms_dbfs, reference_voice_rms_dbfs: authority.rms_dbfs, actual_margin_db: authority.rms_dbfs - result.rms_dbfs, target_margin_db: cueMargin, gain, gain_db: decibels(gain), fallback, source_active_rms_dbfs: sourceMetrics.rms_dbfs });
  }
  return { bed, mix: Float32Array.from(voice, (v, i) => v + bed[i]), cues: reports, margin_db: marginDb };
}
export function commonHeadroomGain(truePeaksDbtp, ceilingDbtp = -1.7) {
  if (!truePeaksDbtp.length || truePeaksDbtp.some(v => !Number.isFinite(v)) || !Number.isFinite(ceilingDbtp) || ceilingDbtp > -1.5) throw Error('Invalid true-peak headroom authority');
  return Math.min(1, linear(ceilingDbtp - Math.max(...truePeaksDbtp)));
}
export function applyCommonGain(samples, gain) {
  if (!(gain > 0 && gain <= 1)) throw Error('Headroom gain must be in (0, 1]');
  return Float32Array.from(samples, value => value * gain);
}
export function measureTruePeak(file, ffmpeg) {
  // loudnorm is run only as a meter; its processed output is discarded. No
  // normalized or limited samples enter an output WAV or delivered video.
  const r = audioCommand(ffmpeg, ['-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', 'loudnorm=I=-23:TP=-1.5:LRA=7:print_format=json', '-f', 'null', '-']);
  const match = r.stderr.toString().match(/\{\s*"input_i"[\s\S]*?\}/g)?.at(-1);
  if (!match) throw Error('True-peak meter returned no input measurement');
  const measured = JSON.parse(match), peak = Number(measured.input_tp);
  if (!Number.isFinite(peak)) throw Error('Invalid true peak');
  return { true_peak_dbtp: peak, integrated_lufs: Number.isFinite(Number(measured.input_i)) ? Number(measured.input_i) : null, loudness_range_lu: Number(measured.input_lra), measurement: 'FFmpeg loudnorm input_tp true-peak input meter; processed output discarded' };
}
export function probeAacRoundTrip(file, ffmpeg) {
  const directory = mkdtempSync(join(tmpdir(), 'preflight-aac-'));
  try {
    const output = join(directory, 'probe.m4a');
    audioCommand(ffmpeg, ['-y', '-v', 'error', '-i', file, '-map', '0:a:0', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '1', output]);
    const meter = measureTruePeak(output, ffmpeg), metrics = signalMetrics(decodeMono(output, ffmpeg, { native: true }));
    return { input_sha256: sha256File(file), codec: 'AAC', bitrate: '192k', sample_rate: 44100, channels: 1, meter, metrics, pass: meter.true_peak_dbtp <= -1 && metrics.clipped_samples === 0, method: 'Temporary AAC M4A encoded, decoded and metered; removed afterward. Final MP4 still needs its own measurement.' };
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
