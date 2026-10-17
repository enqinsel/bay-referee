---
name: bay-referee
description: Produce or revise BAY REFEREE football explanation shorts using the approved Football Comparison format, Engin voice, referee avatar, Turkish master captions, and English/Spanish dub packages. Use for this channel's production and system maintenance, not unrelated video work.
---

# BAY REFEREE

Use the existing channel system. Do not redesign it merely because a new topic arrives. The user primarily supplies topic direction; infer routine editorial and production choices from the authorities below. Ask only for a material missing input or a genuine blocker.

Resolve the project root from the current workspace or its parents: it must contain `package.json`, `brand/bay-referee/channel-skill/bay-referee/` and `brand/bay-referee/production-template/`. All project paths below are relative to that root unless marked otherwise. Do not assume a particular home directory or clone location. If no matching checkout is open, locate the user’s checkout before working. The maintained source of this skill is `brand/bay-referee/channel-skill/bay-referee/`; the discoverable installation is a copy. Update the maintained source first, then synchronize the installation. If the project moved, locate the same authority files before acting; do not create an empty replacement engine.

## Locked decisions

- Channel: **BAY REFEREE**. Football explanation, comparison and systems; short form, social first, broad football audience. Clear, confident, lightly witty where useful, never childish, corporate or meme chaotic.
- Base: **Football Production Kit V1.1** and its approved Football Comparison world. One Turkish visual master; green field/tactics, active user-derived referee host, restrained editorial text and semantic emphasis.
- Voice: **Engin custom voice → Higgsfield → ElevenLabs v4**, stability `0.50`, similarity boost `0.75`. Voice ID and current status: `voice/decision.json`. No automatic fallback to rejected MiniMax or Chatterbox takes.
- Timing: **Whisper segment + word timestamps** from the exact final take. Turkish timing drives Turkish visuals; English and Spanish timings belong to their own dub packages.
- Motion: **V1.1 visible choreography is the approved production reference**. Design motion in the storyboard from final voice and semantic beats. V1.2 contributes optional reusable physical principles, not its full choreography or fixed timing recipes; see [motion-grammar.md](references/motion-grammar.md). Motion Lab is closed; keep the VAR/SAOT master as a read-only reference.
- Languages: Turkish master with **Turkish burned-in captions**; natural global English and broad/LatAm Spanish alternate narration. Do not redesign EN/ES videos or change the master captions by default.
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
- Before rendering or delivering: [engine-and-qa.md](references/engine-and-qa.md), including the exact current test bed and commands.

A request to review a script does not authorize full production. A skill invocation is not standing approval for paid jobs, external upload, publishing or messaging. Apply the user's current task and existing authorization; obtain any required approval at the actual action rather than adding blanket gates. Never claim estimated credits were actually billed. Stop retrying a failed paid job when the authorized scope or spend is exhausted; preserve the failure evidence and complete independent work.

## Completion

Deliver the requested artifacts, their QA evidence and an honest status. Distinguish automated checks, internal editorial review and human approval. Motion consolidation is human-approved at `MOTION_GRAMMAR_APPROVED_FOR_NEW_EPISODES`; this approves the reusable grammar, not permission to start an episode or publish. For future tasks, stop at the status and scope requested by the user. Do not reopen Motion Lab, rerender VAR/SAOT or start a new topic as follow-up work to consolidation.
