import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {CONTRACTS} from "../Scripts/IncenseBallSceneContracts"
import {fixture, target} from "./IncenseBallLeafFixture"
import {check, evidence, object, pose, rotationError, tiltDegrees, visible} from "./IncenseBallLeafGeometry"

/** Criterion 2: sample actual transforms every frame through inversion/release. */
@component
export class IncenseBallRollScenario extends Scenario {
  async run(): Promise<void> {
    const f = await fixture()
    await sleep(5100)
    check(f.state().ui.hintVisible, "Untouched assembled ball must show the five-second hint")
    const shell = f.visuals[0], cup = f.visuals[4], smoke = object(CONTRACTS.smoke)
    const before = pose(shell)
    const outerBefore = before.rotation.invert().multiply(pose(f.visuals[2]).rotation)
    const innerBefore = pose(f.visuals[2]).rotation.invert().multiply(pose(f.visuals[3]).rotation)
    let samples = 0, maxCupTilt = 0, maxSmokeTilt = 0, maxOuterSwing = 0, maxInnerSwing = 0
    let minimumShellAlpha = 1, sawRolling = false
    const monitor = this.createEvent("LateUpdateEvent")
    monitor.bind(() => {
      samples++
      maxCupTilt = Math.max(maxCupTilt, tiltDegrees(cup))
      maxSmokeTilt = Math.max(maxSmokeTilt, tiltDegrees(smoke))
      const shellQ = pose(shell).rotation, outerQ = pose(f.visuals[2]).rotation, innerQ = pose(f.visuals[3]).rotation
      maxOuterSwing = Math.max(maxOuterSwing, rotationError(outerBefore, shellQ.invert().multiply(outerQ)))
      maxInnerSwing = Math.max(maxInnerSwing, rotationError(innerBefore, outerQ.invert().multiply(innerQ)))
      minimumShellAlpha = Math.min(minimumShellAlpha, f.state().shellOpacity)
      sawRolling = sawRolling || f.state().rolling
    })
    try {
      await f.hand.rollUntil(target(CONTRACTS.ball), new vec3(0.3, 0, 0), () => tiltDegrees(shell) > 175)
      const released = pose(shell)
      check(tiltDegrees(shell) > 170, "Shell must actually release upside down")
      check(rotationError(before.rotation, released.rotation) > 150, "Dragging must rotate the shell")
      check(released.position.distance(before.position) > 0.5, "Drag must move the ball along its stand")
      check(!f.state().rolling && !f.state().ui.hintVisible, "Release must end rolling and hide its hint")
      await sleep(1600)
      check(f.state().shellOpacity < 0.5, "Cutaway must persist for about two seconds after release")
      check(rotationError(released.rotation, pose(shell).rotation) < 0.1, "Release must not snap the shell upright")
      await sleep(1000)
      check(f.state().shellOpacity > 0.99, "Silver appearance must return after the hold and fade")
      check(samples > 20 && sawRolling, "Need continuous samples from an actual drag")
      check(maxCupTilt <= 5, `Cup exceeded five degrees: ${maxCupTilt}`)
      check(maxSmokeTilt <= 0.1, `Smoke ceased to point up: ${maxSmokeTilt}`)
      check(maxOuterSwing > 3 && maxInnerSwing > 3, "Both pivot axes must articulate")
      check(minimumShellAlpha < 0.5, "Shell must turn see-through during rolling")
      check(visible(object(CONTRACTS.ember)), "Ember must remain visible in the cup")
      const emberLocal = object(CONTRACTS.ember).getTransform().getLocalPosition()
      check(emberLocal.length < 0.1, "Ember must stay attached to its cup geometry")
      evidence("criterion-2", {samples, maxCupTiltDeg:maxCupTilt, maxSmokeTiltDeg:maxSmokeTilt,
        maxOuterSwingDeg:maxOuterSwing, maxInnerSwingDeg:maxInnerSwing,
        minimumShellAlpha, releaseShellTiltDeg:tiltDegrees(shell)})
    } finally { monitor.enabled = false }
  }
}
