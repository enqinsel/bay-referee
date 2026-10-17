import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { root, prepare } from './runtime.mjs';
const path = resolve(root, process.argv[2] || 'renders/previews/engine-smoke.mp4');
const result = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', path], {
  cwd: root, env: prepare(), encoding: 'utf8', timeout: 60000,
});
if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr);
const metadata = JSON.parse(result.stdout);
const video = metadata.streams.find(s => s.codec_type === 'video');
const rate = video?.avg_frame_rate?.split('/').map(Number);
const fps = rate?.[0] / rate?.[1];
const duration = Number(metadata.format.duration);
const report = { path, width: video?.width, height: video?.height, fps, duration, frames: Number(video?.nb_read_frames), codec: video?.codec_name, pixelFormat: video?.pix_fmt,
  ok: video?.width === 1080 && video?.height === 1920 && fps === 30 && Math.abs(duration - 4) < 0.04 && Number(video?.nb_read_frames) === 120,
  metadata };
mkdirSync(join(root, 'qa/bootstrap'), { recursive: true });
writeFileSync(join(root, 'qa/bootstrap/ffprobe.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, metadata: undefined }, null, 2));
process.exitCode = report.ok ? 0 : 1;
