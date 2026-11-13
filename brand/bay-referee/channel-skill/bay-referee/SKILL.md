---
name: bay-referee
description: Produce or revise BAY REFEREE football explanation shorts using the approved Football Comparison format, Engin voice, referee avatar, Turkish master captions, and English/Spanish dub packages. Use for this channel's production and system maintenance, not unrelated video work.
---

# BAY REFEREE

Use the existing channel system. Do not redesign it merely because a new topic arrives. The user primarily supplies topic direction; infer routine editorial and production choices from the authorities below. Ask only for a material missing input or a genuine blocker.

Resolve the project root from the current workspace or its parents: it must contain `package.json`, `brand/bay-referee/channel-skill/bay-referee/` and `brand/bay-referee/production-template/`. All project paths below are relative to that root unless marked otherwise. Do not assume a particular home directory or clone location. If no matching checkout is open, locate the user’s checkout before working. The maintained source of this skill is `brand/bay-referee/channel-skill/bay-referee/`; the discoverable installation is a copy. Update the maintained source first, then synchronize the installation. If the project moved, locate the same authority files before acting; do not create an empty replacement engine.

## MEDIA-FIRST PRODUCTION

Start each new episode with the real football photographs and footage its story needs. Identify the moments viewers must see and group them by source. A single match recording can cover several goals. For an action or interview the story depends on, verify that the editable clip contains that moment. Use dated archive photographs for context.

Record the findings once in `07_assets/sources.md`. For each critical moment, identify the source, the usable shot or missing file, and the evidence for the rights holder’s permission or licence. Record publication suitability separately for the intended platforms, crop, overlays, languages and credit placement. A public post or viewing link alone establishes neither permission nor access to editable media. Reuse this record on resumption and revisit an entry only when a source, file, permission or intended use changes.

Start paid narration, multilingual dubbing and full video rendering only when usable real media covers the critical moments and its terms allow the intended edit and distribution. If this condition fails, report the missing moments at the outset. Record `MEDIA_BLOCKED` in `00_brief/episode.json` under `review.reason` and set the episode and delivery manifest status to `REVIEW_NEEDED`. Preserve completed work and stop before generating a graphics-led substitute.

Build the premium edit around the verified footage and photographs. Keep the existing Rhubarb-synced referee on screen as the active narrator, positioned clear of the action and captions. Use tactical graphics where they explain a specific play.

## Locked decisions

- Channel: **BAY REFEREE**. Football explanation, comparison and systems; short form, social first, broad football audience. Clear, confident, lightly witty where useful, never childish, corporate or meme chaotic.
- Base: **Football Production Kit V1.1** and its approved Football Comparison world. One Turkish visual master; green field/tactics, active user-derived referee host, restrained editorial text and semantic emphasis.
- Voice: **Engin custom voice → Higgsfield → ElevenLabs v4**, stability `0.50`, similarity boost `0.75`. Voice ID and current status: `voice/decision.json`. No automatic fallback to rejected MiniMax or Chatterbox takes.
- **Mac mini M4 / 16 GB safety:** one local heavy job at a time across Codex sessions/checkouts. TR/EN/ES Whisper, FFmpeg, rendering and other memory-heavy work must run sequentially under the shared process lock. Never delete a live lock. Preserve Whisper medium, 1080×1920 30 FPS, all audio/output settings and QA. Read [resource-safety.md](references/resource-safety.md) before heavy work.
- Timing: **Whisper segment + word timestamps** from the exact final take. Turkish timing drives Turkish visuals; English and Spanish timings belong to their own dub packages.
- Motion: **V1.1 visible choreography is the approved production reference**. Design motion in the storyboard from final voice and semantic beats. V1.2 contributes optional reusable physical principles, not its full choreography or fixed timing recipes; see [motion-grammar.md](references/motion-grammar.md). Motion Lab is closed; keep the VAR/SAOT master as a read-only reference.
- Languages: Turkish master with **Turkish burned-in captions**; natural global English and broad/LatAm Spanish **final YouTube dubs spanning the full master, including closure**. Preserve natural-source narration separately. Final TR/EN/ES SRTs follow their declared final audio. Do not redesign EN/ES videos or change the master captions by default.
- Multilingual delivery: three `1080×1920` covers with the same art/layout and translated text; TR/EN/ES titles, shared-platform descriptions and hashtags, plus one balanced multilingual YouTube tag list. Keep research citations internal. When a license requires public credit, provide it with the release outside the artwork. Exact paths and gates: [production-mode.md](references/production-mode.md).
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
