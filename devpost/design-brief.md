---
status: approved
---

# Design brief: The Incense Ball

Working Lens name: The Incense Ball (default).

## The one spatial moment
A visitor pinches and drags a 30 cm Tang-dynasty silver incense ball along its stand, rolling the shell while it turns partly see-through: the two nested rings swing on their pivots, but the cup, glowing ember, and upward smoke stay upright. They let go with the shell upside down and see why it never spills: “the two rings turn so the cup doesn't have to.”

This is a one-object museum exhibit for museum visitors and students who wonder how ancient machines work. The learner describes the original as a palm-sized silver incense ball more than 1,200 years old, using the same gimbal idea as modern camera stabilizers.

## Why it belongs on glasses
- Uses: draws in the world; leaves the visitor free to move around the exhibit and interact with their hands.
- Why it's better than the phone or laptop version: an enlarged copy stands in the visitor's room, where they can roll it, separate its layers in mid-air, and walk around the parts to inspect the pivot connections that are hard to see in a small museum object behind glass.

## Product or overlay
- Type: product — the virtual exhibit is the experience.
- What the real version would sense: the visitor's viewpoint and standard pointing, pinch, and drag input; no recognition of a real museum object is needed.
- Stand-in for the preview: a virtual stand provides the rolling surface. The ball, rings, cup, ember, and smoke are virtual. Mouse-driven interactions and movement through the simulated room demonstrate the experience; no recognition or AI stand-in is needed.

## Where things live
- Where the user is looking during the main task: slightly downward at a museum plinth, with hands low and close to the body.
- Stand and exhibit: about 90 cm in front of the visitor's starting position. They stay in that place in the room as the visitor moves (default), rather than moving with their head.
- Assembled ball: 30 cm across, with its center about 30 cm below the visitor's starting eye height. Its underside meets the stand's top. The visitor can point and pinch from the starting spot or take one small step to reach it directly.
- Main button: one large button on the front edge of the stand, at about waist height, labeled “Take apart” or “Put together.” Size it to its label, with a pinch target at least 8 cm high (default). Keep it visible and reachable alongside the exhibit.
- Taken-apart display: all five parts shrink to half their assembled size and settle just above the stand, within a total area at most 55 cm wide and 35 cm tall. Include name tags and pivot highlights within that area. Leave 6–8 cm gaps between neighboring parts.
- Top tier — the case: two shell halves, each about 15 cm across at half size, turned so the visitor can see the pin holes inside.
- Bottom tier — the mechanism: outer ring, inner ring, then incense cup, ordered from outside in. Size the rings and cup to nest within the assembled shell, and check that their half-size footprints and gaps fit the display before detailing the model (default).
- Inspection position: the selected part glides about 20 cm toward the visitor, returns to its full assembled size, and slowly turns to present its glowing pivot pins or pin holes. Only one part comes forward at a time.
- Inspection card: a small, readable card beside the selected part, containing one sentence about its job. Keep it inside the visitor's view and clear of the part's important features.
- Name tags (default wording): “Shell half 1,” “Shell half 2,” “Outer ring,” “Inner ring,” and “Incense cup.”

## Hands and input
- Roll: pinch the assembled ball and drag along the top of the stand. The shell rolls in response to the drag, rather than simply sliding, and the rings visibly move about their own pivot pairs. The cup stays within 5 degrees of level throughout rolling and after release, including when the shell is upside down.
- Release: leave the shell in the orientation reached by the visitor; do not snap the shell upright. Keep the ember in the cup and the smoke rising vertically in the room.
- Take apart: pinch the stand's “Take apart” button. The two shell halves open like a clam and slide apart. The outer ring, inner ring, and cup slide out one at a time along their pivots, with a soft click for each step. During the sequence all five parts shrink to half size and settle in their two tiers. Aim for 2.5 seconds total, completing within about 3 seconds.
- Inspect: point at a part for a slight highlight, then pinch it to bring it forward at full size, brighten it, dim the other parts, and show its card. Pinch the selected part again to send it back and close the card. If a different part is selected, return the first before bringing the next forward (default).
- Put together: pinch the same stand button, now labeled “Put together.” Return any inspected part first, then play the disassembly steps in reverse, restore full size, and make the ball ready to roll again. Restore the position and shell orientation it had immediately before disassembly (default interpretation of “exactly where it was”).
- Targets are big and highlight when aimed at. The cup's pinch area is larger than its visible model; use a minimum 8 cm target across (default), without overlapping neighboring targets.
- During assembly or disassembly, keep the main button visible but temporarily unavailable, and pause rolling and part selection until the transition finishes (default).
- Voice (if any) and the button that does the same job: none.

## When things show
- First view: the stand, solid silver ball, one “Take apart” button, and a one-line title. Title text: “Tang-dynasty silver incense ball” (default). The title fades after the first interaction.
- Assembled and idle: the shell looks like solid silver with openwork holes. A softly glowing ember and a thin line of smoke rising through the openwork provide a quiet invitation. No part cards or part name tags are open.
- Rolling: the shell turns partly see-through so the visitor can follow the rings, upright cup, ember, and smoke.
- After release: retain the see-through view for about 2 seconds, then fade the shell back to its normal silver appearance (default timing), so the visitor can see that the cup remains level after an upside-down release.
- Rolling hint: after about 5 seconds without touching the assembled ball, show “Pinch and drag to roll” beside it. Hide the hint as soon as rolling starts, and keep it hidden while taken apart.
- Taken apart: show all five parts and their small name tags. Highlight the pivot pins and corresponding holes so visitors can see the two ring axes at right angles. At rest the pins dim to a faint glow, with no card open.
- Pointing at a part: brighten that part slightly to show it can be pinched.
- Inspecting a part: bring forward and brighten only the selected part, dim the others, and show only its card. Keep its connection features easy to see as it slowly turns.
- Card copy (default wording):
  - Shell half 1: “This is one half of the openwork silver case around the rings and incense cup.”
  - Shell half 2: “Together, the two shell halves enclose the rings and incense cup.”
  - Outer ring: “This ring turns on a pair of pivot pins inside the shell.”
  - Inner ring: “This ring turns on a second pair of pivot pins, at right angles to the first.”
  - Incense cup: “The cup holds the glowing ember and stays upright while the shell rolls.”
- Stand and main button: always present; the button shows only the action appropriate to the assembled or taken-apart state.
- If something needs attention out of view: none. Keep the active task and controls in view from the intended standing position; no attention arrows or calling sounds. The soft disassembly clicks provide local feedback.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. At start, the 30 cm silver ball sits on its stand about 90 cm in front of me, a little below eye level, fully in view, with one “Take apart” button.
2. Dragging the ball rolls it: the shell turns see-through while it moves, the two rings swing, and the cup stays within 5 degrees of level the whole time. If I let go when the shell is upside down, the cup is still level and the smoke still rises straight up.
3. Pinching “Take apart” opens the shell and moves all five parts, at half size, into the two tiers within about 3 seconds. From the start position, every part and its name tag is in view.
4. Pinching a part brings it forward at full size and shows its card while the others dim. Pinching it again sends it back to its place.
5. Pinching “Put together” puts every part back exactly where it was, and the ball can be rolled again.

## Out of scope
- Other museum objects or a larger gallery.
- Recognition of a real artifact or real surface; live camera vision, AI, and voice control.
- Custom hand gestures, two-hand manipulation, shared multiplayer viewing, and remembering the exhibit's position across sessions.
- Real fire or combustion; the ember and smoke are visual effects.

## Risks and open questions
- Exact historical ornament, original dimensions, and a reference museum object or image were not supplied. The historical description above comes from the learner; the brief does not establish an exact replica. Any additional historical or mechanical claims need an appropriate source.
- The nested pivots must remain visibly connected and move consistently with the level cup; the 5-degree requirement applies to the cup's tilt in the room, including upside-down release. Preview verification must check this, not only whether the shell and rings animate.
- The 55 by 35 cm display must include tags, gaps, and accessible pinch targets. Verify its actual fit, the enlarged inspection view, and the waist-height button together from the starting viewpoint; nominal dimensions alone do not establish visibility.
- Defaults for the working name, copy, target sizes, release visibility timing, selection switching, and reconstruction pose remain reviewable choices.
- Feel unproven: sustained comfort, direct reach, real hand-tracking reliability, and readability on physical glasses can only be judged on a device.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
