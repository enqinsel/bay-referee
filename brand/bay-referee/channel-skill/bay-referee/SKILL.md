---
name: bay-referee
description: Produce or revise BAY REFEREE football explainers and archive-led short documentaries using the channel’s approved visual system, Engin voice, referee avatar, Turkish captions and English/Spanish dubs. Use for this channel’s production and system maintenance.
---

# BAY REFEREE

Use the existing channel system. Do not redesign it merely because a new topic arrives. The user primarily supplies topic direction; infer routine editorial and production choices from the authorities below. Ask only for a material missing input or a genuine blocker.

Resolve the project root from the current workspace or its parents: it must contain `package.json`, `brand/bay-referee/channel-skill/bay-referee/` and `brand/bay-referee/production-template/`. All project paths below are relative to that root unless marked otherwise. Do not assume a particular home directory or clone location. If no matching checkout is open, locate the user’s checkout before working. The maintained source of this skill is `brand/bay-referee/channel-skill/bay-referee/`; the discoverable installation is a copy. Update the maintained source first, then synchronize the installation. If the project moved, locate the same authority files before acting; do not create an empty replacement engine.

## MEDIA-FIRST PRODUCTION

When an episode or a passage tells its story through a real event, gesture, interview or reaction, use the [archive editing method](references/format-and-brand.md#editing-with-archive-footage). For a rule, comparison or tactical relationship, use the Football Comparison graphics where they make the relationship visible. A single episode may use both approaches.

Research real match footage, interviews, press conferences and dated archive photographs first. Match each source to the moment it shows. Verify the action or words in the editable file before cutting a specific incident. For context, use a dated photograph or related genuine footage and identify its actual event. A viewing link helps locate footage; it does not establish file access or permission to edit.

Classify the proposed use once in `07_assets/sources.md`. Group shots from the same source when the terms are the same. Keep the source, date, available file/timecode or gap, the basis for the decision, and any required attribution together.

| Rights class | Use in production |
| --- | --- |
| **APPROVED** | Use is verified for the specified edit and distribution. Record the applicable basis, such as ownership, a licence, permission, public-domain status or a substantiated legal exception. Honor its limits and credit requirements. |
| **REVIEW** | The basis for publication is uncertain. Lawfully accessible footage or photography may be used only in a local private viewing edit. Keep the cut and dependent covers local and identify the unresolved use in delivery. |
| **RESTRICTED** | The proposed use is expressly prohibited or access is protected. Exclude it from both private and public cuts. Never bypass DRM, paywalls or access controls, or remove or obscure a broadcaster’s logo or required credit to disguise the source. |

Assess editorial commentary in the context of the actual excerpt, jurisdiction and intended audience, including whether a photograph will also appear on the cover. See [editorial use and release](references/production-mode.md#editorial-use-and-release). Prefer an APPROVED shot that serves the same purpose. When an exact clip is unavailable or restricted, build the best private cut the available genuine material supports. Identify archive context accurately and keep the existing Rhubarb-synced referee clear of the action and captions. Use tactical graphics to explain a specific play. Avoid empty green-screen or graphics-led substitutes. If there is no usable real visual support at all, preserve the work, report the concrete gap and set `review.reason` to `MEDIA_BLOCKED` with episode and manifest `REVIEW_NEEDED`.

An unresolved publication right alone does not stop authorized narration, dubbing, editing, rendering or QA. Deliver a cut containing REVIEW material privately with `REVIEW_NEEDED` and a short release note naming what needs clearance or replacement. Public release requires APPROVED uses throughout and the user’s publication authorization. Reuse the source record across episodes and recheck only changed files, terms or uses. Skip routine licence quotes, price searches, feasibility reports and repeated requests for the user’s licensed files.

## Locked decisions

- Channel: **BAY REFEREE**. Football explanation, comparison and systems; short form, social first, broad football audience. Clear, confident, lightly witty where useful, never childish, corporate or meme chaotic.
- Base: **Football Production Kit V1.1** and its approved Football Comparison world. One Turkish visual master; green field/tactics, active user-derived referee host, restrained editorial text and semantic emphasis.
- Voice: **Engin custom voice → Higgsfield → ElevenLabs v4**, stability `0.50`, similarity boost `0.75`. Voice ID and current status: `voice/decision.json`. No automatic fallback to rejected MiniMax or Chatterbox takes.
- **Mac mini M4 / 16 GB safety:** one local heavy job at a time across Codex sessions/checkouts. TR/EN/ES Whisper, FFmpeg, rendering and other memory-heavy work must run sequentially under the shared process lock. Never delete a live lock. Preserve Whisper medium, 1080×1920 30 FPS, all audio/output settings and QA. Read [resource-safety.md](references/resource-safety.md) before heavy work.
- Timing: **Whisper segment + word timestamps** from the exact final take. Turkish timing drives Turkish visuals; English and Spanish timings belong to their own dub packages.
- Motion: **V1.1 visible choreography is the approved production reference**. Design motion in the storyboard from final voice and semantic beats. V1.2 contributes optional reusable physical principles, not its full choreography or fixed timing recipes; see [motion-grammar.md](references/motion-grammar.md). Motion Lab is closed; keep the VAR/SAOT master as a read-only reference.
- Languages: Turkish master with **Turkish burned-in captions**; natural global English and broad/LatAm Spanish **final YouTube dubs spanning the full master, including closure**. Preserve natural-source narration separately. Final TR/EN/ES SRTs follow their declared final audio. Do not redesign EN/ES videos or change the master captions by default.
- Multilingual delivery: three `1080×1920` covers with the same art/layout and translated text; TR/EN/ES titles, shared-platform descriptions and hashtags, plus one balanced multilingual YouTube tag list. Keep added source labels, archive stamps, photographer/provider names, citations and licence text off video frames, covers, captions and all public social copy. Preserve original embedded identifiers. A story date, location or attributed quote may serve the narration. Use a separate permitted public surface for mandatory credit, or replace the material before release. Exact paths and gates: [production-mode.md](references/production-mode.md).
- Covers use a deep football-green stadium atmosphere, naturally integrated real photography and sports editorial typography. Keep the picture free of decorative bars and technical or source text. See [format-and-brand.md](references/format-and-brand.md).
- The approved mascot hosts the narration on screen. Coordinate lips, eyes, head, torso and purposeful gestures with the final Turkish voice. Scale and place the host around the action and captions.
- Identity: the approved user-based avatar in neutral referee clothing. No copied federation, league, club or sponsor marks. Mascot head is the brand icon; `BAY REFEREE` is the wordmark and persistent quiet watermark.
- Hook starts immediately. No intro bumper. Payoff precedes a **0.7–1.0 second sign-off** with a restrained final whistle closure.
- Cards, whistle and gestures carry meaning; they are not mandatory decoration. Keep stable poses when a new gesture adds no information.
- Preserve old pilots, old voices, avatars and production kits. New work goes into a new versioned production directory.

## Read only what the task needs

- For a full episode / daily Production Mode request, read [production-mode.md](references/production-mode.md).
- For topic selection, research, script and production sequencing: [production-workflow.md](references/production-workflow.md).
- For visual, avatar, caption, highlight and sound decisions: [format-and-brand.md](references/format-and-brand.md).
- For voice generation, translation, Whisper and dub delivery: [voice-and-dubbing.md](references/voice-and-dubbing.md).
- For storyboard, visual planning, animation, rendering or visual revision: [motion-grammar.md](references/motion-grammar.md). Research/script-only tasks do not load the motion library unless motion research is requested.
- Before rendering or delivering: [engine-and-qa.md](references/engine-and-qa.md), including new-episode delivery checks and separately labelled historical test-bed references.

A request to review a script does not authorize full production. A skill invocation is not standing approval for paid jobs, external upload, publishing or messaging. Apply the user's current task and existing authorization; obtain any required approval at the actual action rather than adding blanket gates. Never claim estimated credits were actually billed. Stop retrying a failed paid job when the authorized scope or spend is exhausted; preserve the failure evidence and complete independent work.

## Completion

Deliver the requested artifacts, their QA evidence and an honest status. Distinguish automated checks, internal editorial review and human approval. Motion consolidation is human-approved at `MOTION_GRAMMAR_APPROVED_FOR_NEW_EPISODES`; this approves the reusable grammar, not permission to start an episode or publish. For future tasks, stop at the status and scope requested by the user. Do not reopen Motion Lab, rerender VAR/SAOT or start a new topic as follow-up work to consolidation.
