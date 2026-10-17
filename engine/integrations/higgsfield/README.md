# Higgsfield — official connector contract

This directory documents the existing official Codex/Higgsfield connector and provides local record schemas. It is **not an HTTP adapter, a replacement SDK, or a tested generation pipeline**. No new service, credential file, subscription or custom API was added.

The current audit is [`readiness.json`](readiness.json). On 10 October 2026, the connector exposed 117 tools; 19 relevant contracts are recorded in [`capability-inventory.json`](capability-inventory.json). A fresh read-only `list_workspaces` call succeeded. No generation, estimate, upload, project mutation or workspace-selection call occurred. This proves current account read access; generation and output ingest remain untested. The earlier bootstrap observation remains in [`docs/HIGGSFIELD.md`](../../../docs/HIGGSFIELD.md).

## Benchmark decision

The Michelin Editorial Motion Kit v1 benchmark permits **at most one short supporting asset**. The director must first save `higgsfield-decision.md` next to the experiment design plan, with Need, Why existing real asset + code motion is insufficient, What will be generated, Factual risk, Expected usage duration and Expected benefit. `Decision: NONE` is a complete outcome when existing real assets and authored motion suffice. Do not generate to demonstrate the connector.

[`generation-decision.schema.json`](generation-decision.schema.json) is the machine-readable equivalent when a JSON decision is needed. It enforces NONE = zero assets/zero usage/no generation request, or GENERATE = one supporting asset with a concrete request, reference-rights records and credit-log path. The JSON record complements rather than replaces the requested human-readable decision. It is not automatically submitted by any runtime. Expected usage must fit the actual experiment window; schema validity alone does not establish timing or factual suitability.

## Official capability routing

| Need | Exposed official tool contract | What is established here |
| --- | --- | --- |
| Workspace access | `list_workspaces` | Read executed successfully; selection unchanged |
| Credits/entitlement question | `balance` | Contract discovered; not called in this audit |
| Destination preference | `get_preferences`; `create_project` / `create_folder` only when appropriate | No project created; do not borrow another chat's destination |
| Model constraints | `models_get` and catalog search/recommend tools | Discovered; consult a model only if constraints/roles need checking |
| Cost preflight | `estimate_video_cost` / `estimate_image_cost` | No job submission; **HTTPS image references can still be imported**, so a quote is not universally side-effect-free |
| Supporting media | `generate_video` / `generate_image` | Discovered; untested; one requested output maximum in this benchmark |
| Completion | `jobs_wait` | Wait at most 15 seconds per call; respect returned delay; success means the job reached `completed`, not merely that a request returned |
| User attachment upload | `media_upload_and_confirm` | Limited to user-provided ChatGPT attachments; not an arbitrary repository-path uploader |
| Official remote-sandbox upload | `media_upload` → file-producing `sandbox_exec` plus PUT → `media_confirm` | Follow the published order; confirm only after successful HTTP 200. The sandbox is remote, not this Mac |
| Final display | `show_result` where relevant | Display after validation; single generation tools already show auto-updating widgets |

Names in the table omit the common `mcp__codex_apps__higgsfield_` prefix. Exact callable names and the observed contract text are in the inventory. Future tool contracts take precedence over this dated snapshot.

Do not pass an arbitrary local derivative to the attachment-only helper, invent a media UUID, substitute a custom endpoint, or assume the remote sandbox can read the repository. If a required upload has no supported authorized route, report that concrete gap and use existing local assets; account read access does not close the upload gap.

For a future accepted generation: honor existing user authorization and the applicable official tool instructions. Do not add an unrelated approval ritual. If a tool returns a required allowance choice, present that specific choice and do not select a payment source for the user. Preserve the exact returned parameter adjustments and reuse prepared media IDs. On an ambiguous submission timeout, reconcile the original job; do not submit a second paid attempt automatically.

## Output ingest and provenance

1. Require the original returned job ID and a terminal completed result. Save the requested parameters, resolved model, prompt, references, server adjustments and relevant result record. Do not mistake an input preview or EXR input URL for a processed output.
2. Obtain output bytes only from the official returned result/download route, as production media for this authorized edit. If the environment cannot ingest the result, record the limitation; do not claim a local asset exists. A remote URL or a thumbnail alone is not a completed local ingest.
3. Save unmodified bytes in the episode's generated/raw area, compute SHA256/byte size and inspect dimensions, duration and full decode. Keep original bytes immutable. Any crop, color/treatment or re-encode creates a separate derivative linked through its treatment manifest.
4. Create an [`output-provenance.schema.json`](output-provenance.schema.json) record. `origin` is `ai_generated`, `classification` is **generated supporting media**, and `historical_evidence` is false. Record provider, actual model/job ID, prompt/request/response records, reference hashes and rights evidence, credit log, local path/hash, review result and exact state/time usage. Source/provenance records can retain restricted result metadata; never put expiring signed URL credentials or account identifiers into public review pages.
5. Inspect motion and visual details at actual usage size. Do not treat a valid file as a quality pass. Accept only a supporting role with adequate factual fit and no false historical implication; reject distorted objects, invented factual labels or edge defects that cannot be corrected honestly. Keep all real Guide/archive assets classified separately.
6. Only `visual_review: ACCEPTED`, `factual_fit: SUPPORTING_ONLY_ACCEPTED`, and alpha `PASS` or `NOT_APPLICABLE` may enter the final timeline. `REVIEW_REQUIRED` can be stored for audit but is not an approval. Validate `end > start`, bounds inside the experiment, and that actual aggregate usage matches the decision; those relational checks are outside JSON Schema.

The output schema intentionally does not claim a general copyright grant. Preserve the provider/output-use terms applicable to the actual generation, its input rights and any remaining limits in `rights_record_path`.

## Credit logging

Use one [`credit-log.schema.json`](credit-log.schema.json) entry per attempt; append rather than replacing failed or rejected attempts. Record the decision path, tool/model, exact quote, job ID, selected payment mode, actual charge **only when evidenced**, timestamp and evidence notes. Store quote/request/response evidence with the episode.

- `NONE`: no generation/quote performed, no job, quoted and actual credits 0. The reason must say no spend-capable calls were made; this does not measure account-wide activity.
- `QUOTED`: quote received, no generation submitted, actual generation credits 0. Keep any quote-triggered reference upload in the provenance activity record.
- `SUBMITTED`, `FAILED` or `SETTLED`: a status label alone does not establish the final bill. Unknown actual cost is `null`, never an assumed zero; record refunds only from evidence.
- `SUBMISSION_UNKNOWN`: possible job submission/charge, actual credits `null`. Resolve the original outcome before retrying.
- A before/after account balance can be supporting evidence, but other activity may share the workspace; do not present the difference as a per-job charge without attribution.
- Free-generation/unlimited use must be an explicit applicable selection, recorded with the real entitlement evidence. It is distinct from paid credits and must not silently change after a refusal.

This audit itself issued no spend-capable call, so its generation credit usage is **0**. The benchmark director records the experiment's final NONE/generation result separately. No generated asset or generation quality claim is delivered by this readiness audit.
