# Asset export gate

New renderers must call `assertExportAllowed` **before writing previews, audio windows or encoded output**, using the actual composition asset IDs. Check again before accepting the output if the manifest can change during rendering. Existing V1 episode manifests and renders remain historical records; their old status strings are not silently upgraded.

```js
import {assertExportAllowed} from './engine/assets/publication-gate.mjs';
const gate = assertExportAllowed({
  assets: manifest.assets,
  usedAssetIds: compositionAssetIds,
  mode: requestedMode, // explicit LOCAL_CREATIVE_REVIEW, FINAL, or PUBLICATION_READY
});
```

Store the gate report alongside the input manifest hash and output hash. A thrown `AssetExportBlockedError` carries `.report`; save that failure report without producing an export. Do not hardcode local mode when the caller has requested `FINAL` or `PUBLICATION_READY`.

| Asset state | Local creative review | FINAL / PUBLICATION_READY |
| --- | --- | --- |
| PUBLICATION_CLEARED | Allowed | Requires recorded rights approval and evidence |
| INTERNAL_REFERENCE_ONLY | Allowed | Always blocked |
| GENERATED_SUPPORT | Allowed | Requires recorded rights approval, evidence and factual approval |
| AUTHORED | Allowed | Requires recorded rights approval and evidence |
| BLOCKED | Always blocked | Always blocked |

Every asset record requires `asset_id`, `asset_state`, and `publication: {rights_approved: boolean, evidence: string[]}`. Evidence entries identify retained approval/license/authorship records; this function evaluates those assertions and does not independently determine license validity. `factual_approved` is a separate Boolean for generated support. Source metadata can coexist with these additive fields.

An internal reference must record `restrictions: ["NOT CLEARED FOR PUBLIC RELEASE"]` and `publication.rights_approved: false`. The restriction belongs in the manifest, not as an added watermark or license caption in the creative prototype. Local review reports always retain `PUBLIC_RELEASE_READY: false`, including when every asset happens to be cleared.

List source dependencies in `derived_from: ["source-asset-id"]` for crops, cutouts and other derivatives. The gate checks these recursively: an authored crop cannot bypass the internal-only source photograph. Include fonts, audio and external source data in the used-asset inventory when they are consumed by the composition. Unused candidates may remain in the manifest; a valid unused BLOCKED candidate does not prohibit a render. Missing IDs, malformed rights records, unknown states/modes, duplicate IDs and cyclic dependencies fail closed.

Run focused checks with `node --test tests/publication-gate.test.mjs`. The schema uses the existing project's supported JSON Schema subset; state-dependent behavior is tested in the gate rather than changing legacy planning validation.
