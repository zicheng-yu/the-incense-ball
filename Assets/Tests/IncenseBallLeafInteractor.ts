import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractorTriggerType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import {nextFrame, withTimeout} from "Leaf.lspkg/Utils/common/Utils"

/** Drives the normal SIK events; never calls the exhibit's action methods. */
export class IncenseBallLeafInteractor extends DefaultLeafInteractor {
  async pinch(target: Interactable): Promise<void> {
    await withTimeout(this.trigger(target), 5000, `Pinch timed out: ${target.getSceneObject().name}`)
  }

  /** LEAF drag vectors are centimeters per frame, not total displacement. */
  async rollUntil(
    target: Interactable,
    step: vec3,
    reached: () => boolean,
    timeoutMs = 6000,
  ): Promise<void> {
    await withTimeout(this.enterHover(target), 3000, "Ball never received SIK hover")
    await nextFrame()
    this.setTriggerType(InteractorTriggerType.Select)
    await nextFrame()
    await nextFrame()
    this.overrideDragVector = step
    const start = getTime()
    let movedFrames = 0
    try {
      do {
        await nextFrame()
        movedFrames++
        if ((getTime() - start) * 1000 > timeoutMs) {
          throw new Error("Roll did not reach the requested shell orientation")
        }
      } while (movedFrames < 4 || !reached())
    } finally {
      this.overrideDragVector = vec3.zero()
      this.setTriggerType(InteractorTriggerType.None)
      await nextFrame()
      await nextFrame()
      this.overrideDragVector = undefined
      await withTimeout(this.exitHover(), 3000, "Ball never released SIK hover")
    }
  }
}
