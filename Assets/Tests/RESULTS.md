# The Incense Ball — LEAF preview results

**All five done criteria pass.** Final run: 2026-10-28, Lens Studio 5.23.2, SPECS 27 stereo Interactive Preview (Sunlit Room).
Viewer at the intended standing position (0, 0, 0), looking slightly down at (0, -38, -90). Scenarios ran one at a time with `__leaf__diagnostic_policy: fail-fast` and `__leaf__diagnostic_report_duration_ms: 1000`.

## Done criteria

| Criterion (from `devpost/design-brief.md`) | Scenario ID | Outcome | Measured in the final run |
|---|---|---|---|
| 1. At start, the 30 cm silver ball sits on its stand about 90 cm in front of me, a little below eye level, fully in view, with one "Take apart" button. | `incense-criterion-1-start` | PASS | Mesh vertices 29.99 × 29.92 × 29.99 cm; center (0, -30, -90) cm, i.e. 90 cm ahead and 30 cm below eye height; 0.04 cm gap to the stand top; ball, title, and button inside the view; exactly one enabled main button, labeled "Take apart". |
| 2. Dragging the ball rolls it: the shell turns see-through while it moves, the two rings swing, and the cup stays within 5° of level the whole time. If I let go upside down, the cup is still level and the smoke still rises straight up. | `incense-criterion-2-roll-level` | PASS | 131 per-frame samples. Max cup tilt 0°, max smoke tilt 0°. Outer ring swung 178°, inner ring 55°. Shell opacity fell to 0.22 while rolling, held about 2 s after release, then returned to solid silver. Released at 176.5° (upside down) with no snap back. |
| 3. Pinching "Take apart" opens the shell and moves all five parts, at half size, into the two tiers within about 3 seconds. From the start position, every part and its name tag is in view. | `incense-criterion-3-take-apart` | PASS | 2.46 s. All five parts at 0.5 scale, shells on the top tier, then outer ring, inner ring, and cup. Parts plus tags 44.7 × 32.1 cm (limit 55 × 35). Neighbor gaps 7.0, 6.2, 6.1 cm. Cup pinch target 8 × 8 cm. Non-overlapping targets. |
| 4. Pinching a part brings it forward at full size and shows its card while the others dim. Pinching it again sends it back to its place. | `incense-criterion-4-inspect` | PASS | Each of the five parts came 20 cm forward at full scale, brightened, and turned slowly. The others dimmed. Card title and copy matched the brief exactly. A second pinch returned each part (≤ 0.05 cm, ≤ 0.1°). Switching from shell half 1 to the inner ring returned the first part before the next came forward. |
| 5. Pinching "Put together" puts every part back exactly where it was, and the ball can be rolled again. | `incense-criterion-5-put-together` | PASS | Started from a rolled pose with the cup under inspection. The cup returned first, then all five parts restored within 0.05 cm and 0.1°, at full scale. The button went back to "Take apart". Another roll kept the cup level. |

Every done criterion has a LEAF test.

## Supplementary test

`incense-ik-stand-button` (direct reach with an IK avatar): **FAILED, blocked by test infrastructure**, before any interaction.

> FAILED: incense-ik-stand-button - Error: IK avatar did not become ready

LEAF's IK interactor first downloads a Bitmoji 3D avatar. The download did not finish within 15 s, and the log recorded a network error (`connection error: GOAWAY`) during the attempt. The simulated-input fallback is disabled on purpose, so this result neither proves nor disproves direct reach.

## How the tests work

- They drive the normal SIK hover, pinch, and drag events. They never call the exhibit's action methods.
- Sizes come from mesh vertices and `Text.getBoundingBox`, not rotated engine AABBs, which inflate a sphere's bounds.
- "In view" projects every measured point through the world camera.
- Cup and smoke tilt are sampled every frame from live world transforms during the drag and after release.

## Logic proven / feel unproven

- **Logic proven** (LEAF, in preview): all five done criteria above. The same scenarios also check that the roll hint appears after 5 s untouched and is gone after a roll, and that rolling is paused while the main button stays visible during take-apart.
- **Seen in preview captures, not tested by LEAF:** the title fades after the first interaction, and the inspection card reads clearly beside the part.
- **Implemented, not verified:** the main button is set inactive and dimmed during the take-apart and put-together transitions (`IncenseBallExhibitUI.setAssemblyState`).
- **Feel unproven** (needs SPECS hardware): real hand-tracking reliability, reaching the waist-height button directly, comfort over a longer visit, and text readability on the glasses' additive display.

## History

- 2026-10-23: Built with CLAD through the Lens Studio MCP (Codex session). All five scenarios passed in the live preview, but the MCP connection dropped before the final scene save. The tested title, card, and button positions were recorded in `final-scene-adjustments.json`.
- 2026-10-28: Those three positions were applied through VirtualScene and saved (Claude Code session), and the Lens was named "The Incense Ball". The full suite was run twice, before and after a Lens Studio restart, with identical results.

## Re-run

Scenarios are registered in `IncenseBallLeafIndex.ts` on the `Incense LEAF Tests` scene object. Open the LEAF panel and run them in Preview one at a time. Running two at once resets the scene under the first one. Place the preview camera at the standing viewpoint first: reset, then look at (0, -38, -90).

Screenshots from the final visual check are in `docs/media/` at the repo root. `exploded.png` and `inspection.png` in this folder are from the first build; `basic-exploded.png` and `inspection-debug.png` record layout problems that were fixed during that build.
