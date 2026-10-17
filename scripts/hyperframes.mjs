import { join } from 'node:path';
import { root, run } from './runtime.mjs';
const args = process.argv.slice(2);
// Local-only wrapper: publishing, cloud rendering, auth, TTS and built-in
// transcription are deliberately outside the v0.1 engine interface.
const allowed = new Set(['--help', '--version', 'lint', 'check', 'snapshot', 'render', 'preview', 'info', 'doctor', 'browser', 'compositions', 'timeline']);
// This installed CLI can automatically invoke Gemini for snapshots if a key is
// present in the environment. Never allow that paid/API path through the engine.
if (args[0] === 'snapshot') {
  if (args.filter(arg => arg === '--describe' || arg.startsWith('--describe=')).length > 1) {
    console.error('Duplicate --describe options are not allowed. Remote AI analysis is disabled.');
    process.exit(2);
  }
  const index = args.findIndex(arg => arg === '--describe' || arg.startsWith('--describe='));
  if (index >= 0) {
    const value = args[index].includes('=') ? args[index].split('=')[1] : args[index + 1];
    if (value !== 'false') {
      console.error('Remote AI snapshot analysis is disabled; use --describe false.');
      process.exit(2);
    }
  } else args.push('--describe', 'false');
}
if (!allowed.has(args[0])) {
  console.error('Unsupported engine command. Use a local validation/preview/render command.');
  process.exitCode = 2;
} else {
  run(join(root, 'node_modules', '.bin', 'hyperframes'), args);
}
