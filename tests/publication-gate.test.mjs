import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {ASSET_STATES, EXPORT_MODES, INTERNAL_RESTRICTION, evaluateExportGate, assertExportAllowed, AssetExportBlockedError} from '../engine/assets/publication-gate.mjs';

const asset = (state, patch = {}) => ({
  asset_id: 'subject', asset_state: state,
  publication: {rights_approved: true, evidence: ['retained-rights-record.json']},
  ...patch,
});
const internal = () => asset('INTERNAL_REFERENCE_ONLY', {
  publication: {rights_approved: false, evidence: ['source-candidate-record.json']},
  restrictions: [INTERNAL_RESTRICTION],
});
const evaluate = (record, mode = 'LOCAL_CREATIVE_REVIEW', extra = {}) => evaluateExportGate({assets: [record], usedAssetIds: [record.asset_id], mode, ...extra});
const has = (report, code) => report.errors.some(error => error.code === code);

test('real reference photograph renders locally without gaining publication readiness', () => {
  const report = assertExportAllowed({assets: [internal()], usedAssetIds: ['subject'], mode: 'LOCAL_CREATIVE_REVIEW'});
  assert.equal(report.status, 'PASS');
  assert.equal(report.PUBLIC_RELEASE_READY, false);
  assert.equal(report.distribution, 'LOCAL_CREATIVE_REVIEW_ONLY');
  assert.deepEqual(report.asset_checks[0].publication_blockers, ['INTERNAL_REFERENCE_ONLY']);
});

for (const mode of ['FINAL', 'PUBLICATION_READY']) {
  test(`internal reference automatically blocks ${mode}`, () => {
    const report = evaluate(internal(), mode);
    assert.equal(report.allowed, false);
    assert.equal(report.PUBLIC_RELEASE_READY, false);
    assert.ok(has(report, 'INTERNAL_REFERENCE_ONLY'));
  });
}

for (const mode of EXPORT_MODES) {
  test(`BLOCKED cannot render in ${mode}`, () => {
    const report = evaluate(asset('BLOCKED'), mode);
    assert.equal(report.allowed, false);
    assert.ok(has(report, 'BLOCKED_ASSET'));
  });
}

test('internal source cannot lose its manifest restriction or claim clearance', () => {
  const missing = internal(); delete missing.restrictions;
  assert.ok(has(evaluate(missing), 'INTERNAL_NOTICE_MISSING'));
  const contradictory = internal(); contradictory.publication.rights_approved = true;
  assert.ok(has(evaluate(contradictory), 'CONTRADICTORY_CLEARANCE'));
});

test('GENERATED_SUPPORT allows internal design testing with pending reviews', () => {
  const report = evaluate(asset('GENERATED_SUPPORT', {publication: {rights_approved: false, factual_approved: false, evidence: []}}));
  assert.equal(report.allowed, true);
  assert.equal(report.PUBLIC_RELEASE_READY, false);
  assert.deepEqual(report.asset_checks[0].publication_blockers, ['RIGHTS_NOT_APPROVED', 'RIGHTS_EVIDENCE_MISSING', 'GENERATED_FACTUAL_REVIEW_PENDING']);
});

test('generated support needs both rights and factual approvals for public output', () => {
  const pending = asset('GENERATED_SUPPORT');
  assert.ok(has(evaluate(pending, 'FINAL'), 'GENERATED_FACTUAL_REVIEW_PENDING'));
  pending.publication.factual_approved = true;
  pending.publication.rights_approved = false;
  assert.ok(has(evaluate(pending, 'FINAL'), 'RIGHTS_NOT_APPROVED'));
  pending.publication.rights_approved = true;
  assert.equal(evaluate(pending, 'FINAL').PUBLIC_RELEASE_READY, true);
});

for (const state of ['PUBLICATION_CLEARED', 'AUTHORED']) {
  test(`${state} uses explicit retained approval for public export`, () => {
    assert.equal(evaluate(asset(state), 'PUBLICATION_READY').PUBLIC_RELEASE_READY, true);
    const empty = asset(state, {publication: {rights_approved: true, evidence: []}});
    assert.ok(has(evaluate(empty, 'FINAL'), 'RIGHTS_EVIDENCE_MISSING'));
    const pending = asset(state, {publication: {rights_approved: false, evidence: ['pending.json']}});
    assert.ok(has(evaluate(pending, 'FINAL'), 'RIGHTS_NOT_APPROVED'));
  });
}

test('a cleared local render still makes no public release claim', () => {
  const report = evaluate(asset('PUBLICATION_CLEARED'));
  assert.equal(report.allowed, true);
  assert.equal(report.PUBLIC_RELEASE_READY, false);
  assert.equal(report.asset_checks[0].publication_eligible, true);
});

test('an authored cutout inherits the internal photograph restriction', () => {
  const cutout = asset('AUTHORED', {asset_id: 'cutout', derived_from: ['subject']});
  const options = {assets: [cutout, internal()], usedAssetIds: ['cutout']};
  const local = evaluateExportGate({...options, mode: 'LOCAL_CREATIVE_REVIEW'});
  assert.equal(local.allowed, true);
  assert.deepEqual(local.resolved_asset_ids, ['subject', 'cutout']);
  const publicReport = evaluateExportGate({...options, mode: 'FINAL'});
  assert.equal(publicReport.allowed, false);
  assert.ok(publicReport.errors.some(error => error.asset_id === 'subject' && error.code === 'INTERNAL_REFERENCE_ONLY'));
});

test('unknown source dependencies and dependency cycles fail closed', () => {
  const derived = asset('AUTHORED', {derived_from: ['unknown-photo']});
  assert.ok(has(evaluate(derived), 'MISSING_USED_ASSET'));
  const cyclic = asset('AUTHORED', {derived_from: ['subject']});
  assert.ok(has(evaluate(cyclic), 'DEPENDENCY_CYCLE'));
});

test('unused blocked candidate does not prohibit chosen cleared assets', () => {
  const selected = asset('PUBLICATION_CLEARED');
  const candidate = asset('BLOCKED', {asset_id: 'unused-candidate'});
  const report = evaluate(selected, 'FINAL', {assets: [selected, candidate]});
  assert.equal(report.allowed, true);
  assert.deepEqual(report.resolved_asset_ids, ['subject']);
});

test('empty use lists, missing assets and duplicate identities fail closed', () => {
  const selected = asset('AUTHORED');
  for (const usedAssetIds of [[], ['missing'], ['subject', 'subject'], null, [' ']]) {
    assert.equal(evaluate(selected, 'LOCAL_CREATIVE_REVIEW', {usedAssetIds}).allowed, false);
  }
  assert.ok(has(evaluate(selected, 'LOCAL_CREATIVE_REVIEW', {assets: [selected, selected]}), 'DUPLICATE_ASSET_ID'));
  for (const assets of [[], null, {}, [null]]) assert.equal(evaluate(selected, 'FINAL', {assets}).allowed, false);
});

test('omitted, misspelled and unsafe mode aliases never silently become local mode', () => {
  for (const mode of [undefined, null, '', 'final', 'PUBLIC', 'INTERNAL', 'LOCAL']) {
    assert.ok(has(evaluateExportGate({assets: [internal()], usedAssetIds: ['subject'], mode}), 'INVALID_EXPORT_MODE'));
  }
  assert.equal(evaluateExportGate().allowed, false);
});

test('unknown state and malformed approvals cannot bypass the gate', () => {
  const bad = [
    asset('approved_clear_rights'),
    asset('AUTHORED', {publication: undefined}),
    asset('AUTHORED', {publication: {rights_approved: 'true', evidence: []}}),
    asset('AUTHORED', {publication: {rights_approved: true, evidence: [' ']}}),
    asset('AUTHORED', {publication: {rights_approved: true, evidence: ['a', 'a']}}),
    asset('GENERATED_SUPPORT', {publication: {rights_approved: true, factual_approved: 'true', evidence: ['a']}}),
    asset('AUTHORED', {derived_from: 'source'}),
    asset('AUTHORED', {restrictions: [false]}),
  ];
  for (const malformed of bad) assert.equal(evaluate(malformed).allowed, false);
});

test('gate returns actionable failure audit and does not modify the manifest', () => {
  const options = {assets: [internal()], usedAssetIds: ['subject'], mode: 'FINAL'};
  const before = JSON.stringify(options);
  assert.throws(() => assertExportAllowed(options), error => {
    assert.ok(error instanceof AssetExportBlockedError);
    assert.equal(error.code, 'ASSET_EXPORT_BLOCKED');
    assert.equal(error.report.PUBLIC_RELEASE_READY, false);
    assert.ok(has(error.report, 'INTERNAL_REFERENCE_ONLY'));
    return true;
  });
  assert.equal(JSON.stringify(options), before);
});

test('additive schema stays compatible with the dependency-free project validator', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/asset-rights.schema.json'), 'utf8'));
  assert.deepEqual(schema.properties.asset_state.enum, ASSET_STATES);
  const fixtures = ASSET_STATES.map(state => state === 'INTERNAL_REFERENCE_ONLY' ? internal() : asset(state));
  const invalid = asset('UNKNOWN');
  const python = path.join(root, '.venv/bin/python');
  const child = spawnSync(python, ['-c', [
    'import json, sys',
    'from engine.qa.schema import validate_schema',
    'payload = json.load(sys.stdin)',
    'for record in payload["valid"]: assert not validate_schema(record, payload["schema"])',
    'assert validate_schema(payload["invalid"], payload["schema"])',
  ].join('\n')], {cwd: root, input: JSON.stringify({schema, valid: fixtures, invalid}), encoding: 'utf8'});
  assert.equal(child.status, 0, child.stderr || String(child.error));
});
