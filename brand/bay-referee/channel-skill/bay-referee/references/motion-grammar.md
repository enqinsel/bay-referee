# BAY REFEREE — Approved Motion Grammar

Read for storyboard, visual planning, animation, rendering and visual revision. For a script/research-only request, keep this library unloaded unless motion research itself is requested. This extends the approved brand; it does not authorize production beyond the current request. The library is a selection aid, not an effects quota.

## Human-approved production authority

Consolidation decision, 2026-10-15: **MOTION_GRAMMAR_APPROVED_FOR_NEW_EPISODES**. Human review found V1.1 a clear, successful creative improvement. Its **visible choreography level** is the production reference: readable focus changes, real allocation of space, continuous processes and understandable handoffs. Use that level of clarity in new stories; do not copy the VAR/SAOT scene layout or timeline as a universal template.

V1.2 was technically more refined, with only a small perceptual difference at normal speed. Its full choreography is **not** a production default. Only the six conditional physical principles below are retained. V1.2 easing coefficients, pixel distances and frame counts remain lab-specific evidence; never turn them into hard-coded global defaults. Select magnitude, timing and curves for the current subject, material, composition and exact final narration.

Keep **FOCUS_SHIFT, CONTEXT_RETAIN, PROCESS_BUILD, YIELD_SPACE, HANDOFF, DOCK and LINE_ANCHOR** in the approved production repertoire. Select them when the semantic relationship benefits; no scene or episode must demonstrate all seven. The existing 58-pattern library remains a selective resource. These six physical principles do not add six patterns or require six additional effects.

**Motion Lab is closed.** Preserve `brand/bay-referee/motion-lab-v1-1/` and `motion-lab-v1-2/` as historical evidence, not active production jobs. Do not rerender the VAR/SAOT master. The current human decision is recorded at `brand/bay-referee/motion-research/consolidation-decision.json`; older lab reports describe their review state at delivery and do not supersede this decision. New episode work begins only on a new user request.

## Authority and selection

Preserve the locked channel, green football world, avatar identity, voice, captions, watermark and sign-off. Use the existing renderer. Research may suggest a principle; the user's brief and the approved system decide whether it applies. No reference creator's palette, font, exact layout, code structure or signature choreography transfers to this channel. Do not install external skills or paste their prompts.

For every new episode, design motion from the start of storyboarding: **SCRIPT → FINAL VOICE → WHISPER → SEMANTIC BEATS → VISUAL STATES → MOTION PLAN**. Do not first finish a static video and then add motion as decoration. The motion plan connects each state to its source object, intended relationship, inherited state, focal action and next role before rendering. A specifically requested revision of existing footage remains within that revision's scope.

Music/BPM never controls the voice or state boundaries. Use word/segment timestamps from the exact final take. In the historical VAR/SAOT word map, `transcript_path` is relative to `voice/higgsfield/eleven-v4/var-saot/`, not the project root; resolve it against that episode base and verify its declared hash. A semantic beat is a change of subject, relation, cause, active comparison side, evidence, state or payoff; it is not each spoken word.

Before a transition, identify the current object that can form the next state. Prefer a transform, attachment, handoff, dock, route, anchored line or retained context over a scene reset. A hard cut is valid when the narrative world changes. Object movement usually explains more than moving the camera. Use only a few compatible pattern families per episode, selected for the relation to explain.

Consult [motion-pattern-library.md](motion-pattern-library.md) only for the categories needed. Consult [motion-review-checklist.md](motion-review-checklist.md) before render/delivery. Source observations and adaptation judgments are maintained separately in `brand/bay-referee/motion-research/`; they are not production laws.

## Selected is not visibly executed

`MOTION PATTERN SELECTED` is a planning decision. `MOTION PATTERN VISIBLY EXECUTED` requires a rendered relationship a viewer can follow at **1× speed**; a name in a plan or a code path is insufficient. Each episode production report records:

| Field | Record |
|---|---|
| `selected_patterns` | candidate pattern, scene/absolute time range and intended semantic change |
| `executed_patterns` | pattern, actual scene/time range, visible change, why it helps, and playback/sequence evidence |
| `rejected_patterns` | considered or attempted pattern and reason for exclusion/revision, including no-op, crowding, readability or style drift |
| `RESEARCHED_BUT_NOT_USED` | remaining known patterns outside this production's useful selection; this is not a failure list |

Keep selected patterns unverified until inspected; do not promote them automatically. A pattern may be executed without becoming a future default. For revisions, explain the visible improvement over the approved comparison.

Test roles through composition and continuity: CONTEXT_RETAIN makes the former primary object visibly secondary while preserving its information; a slight opacity adjustment alone may be a no-op. HANDOFF transfers attention or ownership along a readable connection. DOCK ends with the carried object belonging to the receiving system, not merely overlapping it. YIELD_SPACE changes the allocation of space to the explanation; a 2px nudge is not enough to claim it. Choose an appropriate magnitude for the current composition, not a universal travel distance or scale.

For a revision, play the approved comparison and revision at 1× before delivery. A claimed visible choreography improvement fails if its intended relationship is effectively indistinguishable; style drift or impaired readability also fails. Technical polish can be valid with a small perceptual difference, but report that limit instead of calling it a large creative gain or escalating effects to manufacture one. Preserve the approved result if the revision harms readability. For new episodes, review the planned relationship directly at 1×; no recreated VAR/SAOT comparison is required. Record what was actually observed; frame analysis alone does not pass the playback gate.

## Conditional reusable physical principles

These are approved tools, **not mandatory stages for every scene**. Choose only when the focal event benefits; a stable hold or clean authored cut remains valid. Durations, distances and curve parameters belong to the episode's motion plan, never a global V1.2 preset.

| Principle | Use when | Execution and limit |
|---|---|---|
| `ANTICIPATION_ACTION_SETTLE` | An important action benefits from preparation and a readable stop. | Brief preparation → main action → settled composition. Do not insert anticipation before every small change or delay the spoken event. |
| `SPACE_EXCHANGE` | One subject yields working space to another. | The outgoing subject begins to release space; the incoming explanation takes it during the same controlled exchange. End in a clear primary/context composition, not two unrelated animations. |
| `CAUSALITY_CHAIN` | Several steps form one explanatory dependency. | Each state visibly causes the next from a known object/contact/anchor. Ball → contact → measurement → anchor → line is the lab example, not a sequence to impose on unrelated topics or a claim of literal technology internals. |
| `OWNERSHIP_CHANGE` | An object is accepted by a receiving system. | After admission, move it into the receiver's actual local coordinate/parent system; receiver movement carries the content. Do not keep independent world transforms or substitute a duplicate behind the border. |
| `POSE_CUT_AT_ACTION_APEX` | Switching existing raster poses benefits from a directional gesture. | Use whole-body preparation, a clean cut at the meaningful action apex and an appropriate settle. Choose an existing pose and target. Cut cleanly between drawings. Within each pose, animate the speaking host’s local face and body controls as described in [format-and-brand.md](format-and-brand.md). |
| `PHYSICAL_FOLLOW_THROUGH` | The main stop/contact leaves a small material response. | Let rotation, contact, receiving surface or local seating finish as a consequence of that action. Finish promptly; no compulsory secondary motion, jello, bounce or perpetual idle. |

Keep the existing focus budget: a physical response supports its primary event; it does not justify another independently competing effect. Verify that the relationship reads at 1×. If the principle only complicates the scene, omit it.

## Plan each state

Record the following before rendering:

| Field | Required decision |
|---|---|
| narration range | exact final-take words, absolute seconds and frame boundaries |
| semantic purpose | what relationship becomes understandable |
| main object | a named football object, evidence object or word |
| inherited state | identities, positions, camera, paths, selected facts preserved from the previous state |
| patterns | the smallest useful set; why each is needed |
| focal event | the one event the viewer should follow |
| text event | CAPTION / EDITORIAL TEXT / LABEL, authoritative wording, entrance/hold/exit |
| avatar | target, existing pose, cause for switch; a still hold is valid |
| sound | approved SFX candidate and visible contact; or intentional silence |
| hold | reading, inference or consequence; explain narration-active holds above roughly 2–3s |
| exit | source object → next role/target; separately timed outgoing and incoming elements |

Never add motion just because a field looks empty. Default concurrent budget: **1 principal semantic action + 0–1 support action + optional editorial text**. All must serve the same focal event. An avatar gesture, bright area, moving player and strong text highlight cannot compete equally. A group movement is one event only when the objects participate in the same readable cause; renaming four independent events as one does not satisfy the budget.

## Object and material behavior

| Material | Useful behavior | Wrong default |
|---|---|---|
| ball | contact, roll, kick, trajectory; speed changes follow cause | idle floating |
| paper / contract | slide, unfold, fold, stack, settle | generic spring pop |
| referee card | raised and held for an actual caution/dismissal meaning | attention confetti |
| player | occupy space, turn, move along a meaningful run | orbit around text |
| route | draw from source to intended destination, stop/retract when relation changes | detached looping arrow |
| money | transfer, block, collect with visible ownership | decorative currency rain |
| line | anchor, measure, grow from tracked position | arbitrary sweep disconnected from players |
| photo | frame, crop, cutout, physical layer, pinned evidence | full-screen slideshow by default |

Real media is material inside the scene, not an automatic replacement for the entire video. Use it only when evidence benefits from it. A label identifies its object and may remain attached during travel; it must not become new narration. Don't invent facts from an abstract metaphor.

## Text roles

**CAPTION** covers the whole speech using the approved timing, glyph layout, safe area and restrained presentation. No full karaoke. **EDITORIAL TEXT** selects a memorable spoken concept and can receive a short motion or one semantic emphasis. **LABEL** identifies an object or technical relation and inherits its attachment/placement.

Keep exact wording from the current narration/text audit. Role colors remain separate from semantic emphasis. Reuse approved accent/underline/hard marker; never activate all treatments together. A phrase may enter, settle, then emphasize its key word on the word anchor. Outgoing text must clear before incoming text needs the same space. Type-to-object transformation is exceptional: only use when it explains the concept without damaging caption readability. Type motion must not compete with a tactical cause/effect event.

## Character and camera

The host directs attention; it is not a perpetual motion source. Use GESTURE_LEAD/CONFIRM, GAZE_LEAD, YIELD_SPACE, REACTION or PROP_SEMANTIC only for a named target/cause. Existing raster poses are not an articulated rig: do not claim independent eye, hand or head motion that assets cannot provide. Prefer an appropriate existing pose and stable hold; never create intermediate anatomy by crossfading. Any lead must be bounded against the actual word event and logged.

Keep a fixed camera unless hierarchy, a spatial reveal, detail examination or world scale actually changes. Write that reason before moving it. No default slow zoom, random push-in or decorative parallax. A docked analysis can change scale while the camera remains fixed.

## Easing choices

Use durations measured against available narration, path distance and mobile readability; these are families, not mandatory frame recipes.

| Family | Use | Restraint |
|---|---|---|
| fast controlled ease | attention transfer, short object placement | accelerate/decelerate without unexplained bounce |
| small overshoot | an object with a visible stop/contact | use only if weight benefits; do not overshoot target information |
| physical deceleration | rolling/sliding object loses speed | velocity inherited from cause, no arbitrary sine loop |
| restrained spring | flexible/elastic material with a reason | small overshoot; no universal cartoon spring |
| snap / lock | selected contact, final docking fit | single state locks, no repeated pulse |
| linear measurement | line/route revealing distance or order | use source anchor; don't imply a physical speed measurement unless factual |
| soft settle | phrase or inert object reaches reading position | finish promptly; no perpetual micro-drift |

## Anti-pattern defaults and positive replacements

No random particles, neon/glow everywhere, flare, RGB split, camera shake, decorative HUD/grid/corner metadata/scanlines, default crossfade/blur-in, continuous bounce/floating, large overshoot, random zoom/rotation, generic stock UI, empty 3D or effect-hidden state reset. No `Math.random`, wall clock, hidden timer or render-order state. Repeated animation templates require a semantic reason each time.

Instead: carry the existing object into the next role, preserve a selected fact quietly, draw from the known source, let the character confirm a consequence, or hold so the viewer can infer. Specific story needs may justify an otherwise excluded technique, but explain the semantic reason and review it rather than treating a ban list as style decoration.

## Deterministic build and preflight

Same absolute timestamp + same inputs = same composition, regardless of render order. Keep existing engine conventions, final narration duration and integer-frame caption membership. Version revisions; never overwrite an approved master. A new library is not permission to rebuild the engine, replace speech or publish.

Before a full render: generate state strip, short consecutive frame sequences at critical transitions, and full 1080×1920 representatives. Inspect actual sequences as well as stills. Test repeated timestamps in shuffled order; verify object anchors, captions, avatar alpha, text authority, single focus and audio events. Record selected versus visibly executed patterns. For a motion revision, the review surface includes a transition loop or 6–12 timestamped side-by-side sequence frames for each test, in addition to 1× playback; a poster alone cannot demonstrate choreography. Visual inspection cannot prove speech/SFX quality if sound was not auditioned.

Run [motion-review-checklist.md](motion-review-checklist.md). Explain every hold above 2–3 seconds during narration. Review with decorative effects removed: if the relationship vanishes, repair the idea. Render only the current brief's authorized scope and stop at its requested review status; a laboratory test count is not a requirement for future episodes.
