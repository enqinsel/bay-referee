/** Asset use is checked before output creation; a local review is never a release. */
export const ASSET_STATES = Object.freeze([
  'PUBLICATION_CLEARED', 'INTERNAL_REFERENCE_ONLY', 'GENERATED_SUPPORT', 'AUTHORED', 'BLOCKED',
]);
export const EXPORT_MODES = Object.freeze(['LOCAL_CREATIVE_REVIEW', 'FINAL', 'PUBLICATION_READY']);
export const INTERNAL_RESTRICTION = 'NOT CLEARED FOR PUBLIC RELEASE';

const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const uniqueStrings = value => Array.isArray(value) && value.every(nonempty) && new Set(value).size === value.length;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function publicationReasons(asset) {
  if (asset.asset_state === 'BLOCKED') return ['BLOCKED_ASSET'];
  if (asset.asset_state === 'INTERNAL_REFERENCE_ONLY') return ['INTERNAL_REFERENCE_ONLY'];
  const reasons = [];
  if (asset.publication.rights_approved !== true) reasons.push('RIGHTS_NOT_APPROVED');
  if (!asset.publication.evidence.length) reasons.push('RIGHTS_EVIDENCE_MISSING');
  if (asset.asset_state === 'GENERATED_SUPPORT' && asset.publication.factual_approved !== true) {
    reasons.push('GENERATED_FACTUAL_REVIEW_PENDING');
  }
  return reasons;
}

/**
 * Pure, fail-closed gate. Pass the actual assets consumed by the composition as
 * usedAssetIds, never infer use from candidate/selected editorial statuses.
 * derived_from dependencies inherit restrictions, including source photographs.
 * This evaluates recorded approvals; it cannot itself confer or verify a license.
 */
export function evaluateExportGate({assets, usedAssetIds, mode} = {}) {
  const errors = [];
  const add = (code, asset_id, detail) => errors.push({code, ...(asset_id ? {asset_id} : {}), detail});
  if (!EXPORT_MODES.includes(mode)) add('INVALID_EXPORT_MODE', null, 'An explicit supported export mode is required.');
  if (!Array.isArray(assets) || !assets.length) add('INVALID_ASSET_MANIFEST', null, 'assets must be a nonempty array.');
  if (!uniqueStrings(usedAssetIds) || !usedAssetIds.length) add('INVALID_USED_ASSET_IDS', null, 'usedAssetIds must be a nonempty unique string array.');

  const byId = new Map();
  for (const asset of Array.isArray(assets) ? assets : []) {
    if (!record(asset) || !nonempty(asset.asset_id)) {
      add('INVALID_ASSET_RECORD', null, 'Every asset requires a nonempty asset_id.');
      continue;
    }
    const id = asset.asset_id;
    if (byId.has(id)) add('DUPLICATE_ASSET_ID', id, 'Asset identities must be unambiguous.');
    else byId.set(id, asset);
    if (!ASSET_STATES.includes(asset.asset_state)) add('INVALID_ASSET_STATE', id, 'Unsupported or absent asset_state.');
    if (!record(asset.publication) || typeof asset.publication.rights_approved !== 'boolean'
        || !uniqueStrings(asset.publication.evidence)
        || (asset.publication.factual_approved !== undefined && typeof asset.publication.factual_approved !== 'boolean')) {
      add('INVALID_PUBLICATION_RECORD', id, 'publication requires boolean rights_approved and an evidence string array.');
    }
    if (asset.restrictions !== undefined && !uniqueStrings(asset.restrictions)) {
      add('INVALID_RESTRICTIONS', id, 'restrictions must be a unique string array.');
    }
    if (asset.derived_from !== undefined && !uniqueStrings(asset.derived_from)) {
      add('INVALID_DEPENDENCIES', id, 'derived_from must be a unique string array of asset IDs.');
    }
    if (asset.asset_state === 'INTERNAL_REFERENCE_ONLY') {
      if (!Array.isArray(asset.restrictions) || !asset.restrictions.includes(INTERNAL_RESTRICTION)) {
        add('INTERNAL_NOTICE_MISSING', id, `Manifest must state ${INTERNAL_RESTRICTION}.`);
      }
      if (asset.publication?.rights_approved !== false) {
        add('CONTRADICTORY_CLEARANCE', id, 'An internal reference cannot claim publication rights approval.');
      }
    }
  }

  const used = new Set(), visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) { add('DEPENDENCY_CYCLE', id, 'Asset derivation must not contain a cycle.'); return; }
    if (used.has(id)) return;
    const asset = byId.get(id);
    if (!asset) { add('MISSING_USED_ASSET', id, 'Used asset or source dependency is absent from the manifest.'); return; }
    visiting.add(id);
    if (uniqueStrings(asset.derived_from)) for (const dependency of asset.derived_from) visit(dependency);
    visiting.delete(id);
    used.add(id);
  }
  if (uniqueStrings(usedAssetIds)) for (const id of usedAssetIds) visit(id);

  const assetChecks = [];
  for (const id of used) {
    const asset = byId.get(id);
    const valid = ASSET_STATES.includes(asset.asset_state) && record(asset.publication)
      && typeof asset.publication.rights_approved === 'boolean' && uniqueStrings(asset.publication.evidence);
    const reasons = valid ? publicationReasons(asset) : ['INVALID_ASSET_RECORD'];
    if (asset.asset_state === 'BLOCKED') add('BLOCKED_ASSET', id, 'BLOCKED assets cannot be used in any render.');
    if (mode === 'FINAL' || mode === 'PUBLICATION_READY') {
      for (const reason of reasons.filter(reason => reason !== 'BLOCKED_ASSET')) {
        add(reason, id, 'Publication export requires source clearance and applicable factual approval.');
      }
    }
    assetChecks.push({asset_id: id, asset_state: asset.asset_state ?? null, publication_eligible: reasons.length === 0, publication_blockers: reasons});
  }
  const allowed = errors.length === 0;
  const publicMode = mode === 'FINAL' || mode === 'PUBLICATION_READY';
  return {
    schema_version: '1.0.0', mode: mode ?? null, status: allowed ? 'PASS' : 'BLOCKED', allowed,
    PUBLIC_RELEASE_READY: allowed && publicMode,
    distribution: publicMode ? 'PUBLICATION' : mode === 'LOCAL_CREATIVE_REVIEW' ? 'LOCAL_CREATIVE_REVIEW_ONLY' : 'UNDEFINED',
    requested_asset_ids: Array.isArray(usedAssetIds) ? [...usedAssetIds] : [],
    resolved_asset_ids: [...used], asset_checks: assetChecks, errors,
    note: 'Evaluates recorded approvals. No license is granted or independently verified by this gate.',
  };
}

export class AssetExportBlockedError extends Error {
  constructor(report) {
    super(`Asset export blocked (${String(report.mode)}): ${report.errors.map(e => `${e.asset_id ? e.asset_id + ': ' : ''}${e.code}`).join('; ')}`);
    this.name = 'AssetExportBlockedError';
    this.code = 'ASSET_EXPORT_BLOCKED';
    this.report = report;
  }
}

export function assertExportAllowed(options) {
  const report = evaluateExportGate(options);
  if (!report.allowed) throw new AssetExportBlockedError(report);
  return report;
}
