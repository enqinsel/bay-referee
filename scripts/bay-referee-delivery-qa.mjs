#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {evaluateDelivery} from '../engine/bay-referee/delivery-qa.mjs';

const args = process.argv.slice(2);
if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
  console.log('Usage: node scripts/bay-referee-delivery-qa.mjs <episode-path> [--output]\nRead-only JSON stdout by default. --output additionally writes 08_delivery/qa-report.json. Exit 0 only when every delivery gate passes.');
} else if (args.length < 1 || args.length > 2 || args[0].startsWith('-') || (args.length === 2 && args[1] !== '--output')) {
  console.error('Usage: node scripts/bay-referee-delivery-qa.mjs <episode-path> [--output]');
  process.exitCode = 2;
} else {
  try {
    const report = await evaluateDelivery(args[0], {regenerateReport: args[1] === '--output'});
    const json = `${JSON.stringify(report, null, 2)}\n`;
    if (args[1] === '--output') {
      const root = path.resolve(args[0]);
      for (const directory of [root, path.join(root, '08_delivery')]) {
        const stat = await fs.lstat(directory);
        if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Report output parent must be a real directory.');
      }
      const output = path.join(root, '08_delivery/qa-report.json');
      try { if (!(await fs.lstat(output)).isFile() || (await fs.lstat(output)).isSymbolicLink()) throw new Error('Refusing unsafe report output.'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      // The only write is this explicit derived report; no manifest status/hash is promoted.
      const temp = path.join(root, '08_delivery', `.qa-report-${process.pid}.tmp`);
      await fs.writeFile(temp, json, {flag: 'wx'});
      try { await fs.rename(temp, output); } finally { await fs.rm(temp, {force: true}); }
    }
    console.log(json.trimEnd());
    process.exitCode = report.status === 'PASS' ? 0 : 1;
  } catch (error) {
    console.error(`Delivery QA failed: ${error.message}`);
    process.exitCode = 1;
  }
}
