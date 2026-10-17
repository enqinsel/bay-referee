import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, prepare } from './runtime.mjs';

const env = prepare();
const checks = [];
function check(name, command, args) {
  const r = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', timeout: 90000 });
  const output = `${r.stdout || ''}${r.stderr || ''}`.trim();
  checks.push({ name, ok: !r.error && r.status === 0, output: r.error?.message || output });
}
check('node', process.execPath, ['--version']);
check('npm', 'npm', ['--version']);
check('git', 'git', ['--version']);
check('python_venv', join(root, '.venv/bin/python'), ['--version']);
check('pip', join(root, '.venv/bin/python'), ['-m', 'pip', '--version']);
check('ffmpeg', 'ffmpeg', ['-version']);
check('ffprobe', 'ffprobe', ['-version']);
const hf = join(root, 'node_modules/.bin/hyperframes');
check('hyperframes', hf, ['--version']);
check('browser', hf, ['browser', 'path']);
check('whisper_install', join(root, '.venv/bin/python'), ['scripts/transcribe.py', '--validate-install']);
const report = {
  checkedAt: new Date().toISOString(),
  platform: process.platform, arch: process.arch,
  ok: checks.every(c => c.ok), checks,
  higgsfield: {
    integration: 'official Codex plugin (outside local subprocess)',
    localCliAvailable: spawnSync('which', ['higgsfield'], { encoding: 'utf8' }).status === 0,
    auth: 'See docs/HIGGSFIELD.md for dated connector verification; doctor does not infer live auth.',
    generationEnabled: false,
  },
  config: JSON.parse(readFileSync(join(root, 'config/engine.config.json'), 'utf8')),
};
if (process.argv.includes('--report')) {
  mkdirSync(join(root, 'qa/bootstrap'), { recursive: true });
  writeFileSync(join(root, 'qa/bootstrap/doctor.json'), JSON.stringify(report, null, 2) + '\n');
}
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Video Engine doctor — ${process.platform}/${process.arch}`);
  for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}: ${c.output.split('\n')[0]}`);
  console.log('Higgsfield: recorded connector verification in docs/HIGGSFIELD.md; no credit use.');
}
process.exitCode = report.ok ? 0 : 1;
