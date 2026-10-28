import {sleep, getColliderSize} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {IncenseBallMain} from "../Scripts/IncenseBallMain"
import {IncenseBallExhibitUI} from "../Scripts/IncenseBallExhibitUI"
import {CONTRACTS, PART_NAMES} from "../Scripts/IncenseBallSceneContracts"
import {IncenseBallLeafInteractor} from "./IncenseBallLeafInteractor"
import {check, object, until} from "./IncenseBallLeafGeometry"

export async function fixture() {
  await sleep(1500)
  const main = object(CONTRACTS.exhibit).getComponent(IncenseBallMain.getTypeName()) as IncenseBallMain
  const ui = object(CONTRACTS.ui).getComponent(IncenseBallExhibitUI.getTypeName()) as IncenseBallExhibitUI
  await until(() => main.ready && ui.ready, 3000, "Exhibit did not initialize")
  check(main.getSnapshot().phase === "assembled", "Scenario requires a fresh assembled preview")
  const parts = PART_NAMES.map(object)
  const visuals = PART_NAMES.map(name => object(name + " Visual"))
  const tags = PART_NAMES.map(name => object(name + " Tag"))
  return {main, ui, parts, visuals, tags,
    camera: WorldCameraFinderProvider.getInstance().getComponent(),
    hand: new IncenseBallLeafInteractor(),
    state: () => main.getSnapshot(),
  }
}

export function target(name: string) {
  const targets = findInteractablesByName(name, undefined, true)
  check(targets.length === 1, `Expected one enabled SIK target named ${name}, got ${targets.length}`)
  return targets[0]
}

export async function takeApart(f: Awaited<ReturnType<typeof fixture>>) {
  const start = getTime()
  await f.hand.pinch(target(CONTRACTS.button))
  await until(() => f.state().phase === "exploded", 3100, "Disassembly did not complete")
  return (getTime() - start) * 1000
}

export function targetDimensions(name: string): vec3 {
  const t = target(name)
  check(t.colliders.length > 0, `${name} needs a collider`)
  return t.colliders.reduce((size, c) => vec3.max(size,
    getColliderSize(c).mult(c.getTransform().getWorldScale())), vec3.zero())
}
