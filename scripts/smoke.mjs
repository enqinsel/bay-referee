import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, prepare } from './runtime.mjs';
const env = prepare();
const steps = [
  ['doctor', ['scripts/doctor.mjs', '--report']],
  ['tests', ['scripts/python.mjs', '-m', 'unittest', 'discover', '-s', 'tests', '-v']],
  ['lint', ['scripts/hyperframes.mjs', 'lint', 'engine/composition/smoke', '--json']],
  ['check', ['scripts/hyperframes.mjs', 'check', 'engine/composition/smoke', '--strict', '--at', '0,0.5,1,2,3.5', '--json']],
  ['snapshot', ['scripts/hyperframes.mjs', 'snapshot', 'engine/composition/smoke', '--at', '0,1,2,3.9', '--output', 'qa/bootstrap/snapshots']],
  ['render', ['scripts/render-smoke.mjs']],
  ['ffprobe', ['scripts/probe.mjs']],
];
const results = [];
mkdirSync(join(root, 'qa/bootstrap'), { recursive: true });
for (const [name, args] of steps) {
  console.log(`Running ${name}...`);
  const start = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: root, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  writeFileSync(join(root, `qa/bootstrap/${name}.log`), `${r.stdout || ''}\n${r.stderr || ''}\n${r.error?.message || ''}`);
  const ok = r.status === 0 && !r.error;
  results.push({ name, ok, seconds: (Date.now() - start) / 1000 });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) { console.error(r.stderr || r.stdout || r.error); break; }
}
const report = { checkedAt: new Date().toISOString(), ok: results.length === steps.length && results.every(r => r.ok), steps: results };
writeFileSync(join(root, 'qa/bootstrap/smoke.json'), JSON.stringify(report, null, 2) + '\n');
process.exitCode = report.ok ? 0 : 1;
