import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {IncenseBallExhibitUI} from "../Scripts/IncenseBallExhibitUI"
import {CONTRACTS, PART_NAMES} from "../Scripts/IncenseBallSceneContracts"
import {assertInView, bounds, check, evidence, object, size, union, visible} from "./IncenseBallLeafGeometry"

/** Criterion 1: actual start geometry, support, view, and the sole action. */
@component
export class IncenseBallStartScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const camera = WorldCameraFinderProvider.getInstance().getComponent()
    object(CONTRACTS.ball)
    const stand = object(CONTRACTS.stand)
    const uiRoot = object(CONTRACTS.ui)
    const ui = uiRoot.getComponent(IncenseBallExhibitUI.getTypeName()) as IncenseBallExhibitUI
    check(ui.ready, "Exhibit UI did not initialize")
    const shells = PART_NAMES.slice(0, 2).map(object)
    const shellBox = union(shells.map(bounds))
    const dimensions = size(shellBox)
    for (const d of [dimensions.x, dimensions.y, dimensions.z]) {
      check(Math.abs(d - 30) <= 0.4, `Silver ball must be 30 cm across, observed ${d}`)
    }
    const center = shellBox.min.add(shellBox.max).uniformScale(0.5)
    const eye = camera.getTransform().getWorldPosition()
    const offset = center.sub(eye)
    check(Math.abs(Math.sqrt(offset.x * offset.x + offset.z * offset.z) - 90) <= 2,
      "Ball must start about 90 cm horizontally from the viewer")
    check(Math.abs(offset.y + 30) <= 2, "Ball center must start 30 cm below eye height")
    const supportGap = shellBox.min.y - bounds(stand).max.y
    check(Math.abs(supportGap) <= 0.5, `Ball must meet stand top; gap ${supportGap} cm`)
    assertInView(camera, shellBox, "Assembled silver ball")
    const button = object(CONTRACTS.button)
    check(visible(button), "Main button must remain visible")
    assertInView(camera, bounds(button), "Stand button")
    check(findInteractablesByName(CONTRACTS.button, undefined, true).length === 1,
      "Exactly one enabled main button must exist")
    const label = object("Incense Main Button Label").getComponent("Component.Text") as Text
    check(label.text === "Take apart", "Initial main action must say Take apart")
    const title = object("Incense Title")
    check(visible(title), "Initial title must be visible")
    check((title.getComponent("Component.Text") as Text).text === "Tang-dynasty silver incense ball", "Title copy differs from brief")
    assertInView(camera, bounds(title), "Exhibit title")
    const state = ui.getSnapshot()
    check(!state.cardVisible && !state.tagsVisible, "Cards and part tags must be hidden when assembled")
    evidence("criterion-1", {diameterCm: dimensions, center, supportGapCm: supportGap, buttonLabel: label.text})
  }
}
