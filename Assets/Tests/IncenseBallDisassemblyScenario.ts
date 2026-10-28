import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {PART_NAMES, CONTRACTS} from "../Scripts/IncenseBallSceneContracts"
import {fixture, target, targetDimensions} from "./IncenseBallLeafFixture"
import {assertInView, bounds, check, evidence, object, size, union, until, visible} from "./IncenseBallLeafGeometry"

/** Criterion 3: timed SIK transition, five half-size parts, tags, and view. */
@component
export class IncenseBallDisassemblyScenario extends Scenario {
  async run(): Promise<void> {
    const f = await fixture()
    const button = target(CONTRACTS.button)
    const ball = target(CONTRACTS.ball)
    let begin = -1
    const off = button.onTriggerEnd.add(() => {begin = getTime()})
    try { await f.hand.pinch(button) } finally { off() }
    check(f.state().phase === "disassembling", "Button must start disassembly")
    check(!ball.enabled, "Rolling must pause while taking apart")
    check(visible(object(CONTRACTS.button)), "Main button must stay visible during transitions")
    await until(() => f.state().phase === "exploded", 3100, "Parts failed to settle")
    const durationMs = (getTime() - begin) * 1000
    check(begin >= 0 && durationMs <= 3100, `Disassembly exceeded about three seconds: ${durationMs} ms`)
    for (let i=0; i<5; i++) {
      check(visible(f.parts[i]), `${PART_NAMES[i]} is hidden`)
      const s=f.visuals[i].getTransform().getLocalScale()
      check(Math.abs(s.x-0.5)<0.001 && Math.abs(s.y-0.5)<0.001 && Math.abs(s.z-0.5)<0.001, `${PART_NAMES[i]} must be half size`)
      check(visible(f.tags[i]), `${PART_NAMES[i]} tag is hidden`)
      check((object(PART_NAMES[i]+" Name").getComponent("Component.Text") as Text).text===PART_NAMES[i], "Part name differs from brief")
      assertInView(f.camera, bounds(f.parts[i]), PART_NAMES[i])
      assertInView(f.camera, bounds(f.tags[i]), PART_NAMES[i]+" tag")
      target(PART_NAMES[i])
    }
    const partsBox=union(f.parts.map(bounds)), displayBox=union([partsBox,...f.tags.map(bounds)])
    const extent=size(displayBox)
    check(extent.x<=55.1 && extent.y<=35.1, `Parts and labels exceed 55 x 35 cm: ${extent.x} x ${extent.y}`)
    check(f.parts[0].getTransform().getWorldPosition().y > f.parts[2].getTransform().getWorldPosition().y+10, "Shell halves must occupy the top tier")
    check(f.parts[2].getTransform().getWorldPosition().x < f.parts[3].getTransform().getWorldPosition().x &&
      f.parts[3].getTransform().getWorldPosition().x < f.parts[4].getTransform().getWorldPosition().x, "Bottom tier must run outer ring, inner ring, cup")
    const gaps=[[0,1],[2,3],[3,4]].map(([a,b])=>bounds(f.parts[b]).min.x-bounds(f.parts[a]).max.x)
    check(gaps.every(g=>g>=5.7 && g<=8.3), `Neighboring visible parts need about 6–8 cm gaps: ${gaps}`)
    const cupTarget=targetDimensions(PART_NAMES[4])
    check(cupTarget.x>=8 && cupTarget.y>=8, "Cup pinch target must be at least eight centimeters across")
    for (const [a,b] of [[0,1],[2,3],[3,4]]) {
      const ax=f.parts[a].getTransform().getWorldPosition().x, bx=f.parts[b].getTransform().getWorldPosition().x
      check(bx-ax > (targetDimensions(PART_NAMES[a]).x+targetDimensions(PART_NAMES[b]).x)/2, "Neighboring pinch targets must not overlap")
    }
    check(f.state().ui.buttonLabel==="Put together" && !f.state().ui.cardVisible && !f.state().ui.hintVisible, "Taken-apart UI state is incorrect")
    assertInView(f.camera,bounds(object(CONTRACTS.button)),"Put together button")
    evidence("criterion-3",{durationMs,displayCm:extent,neighborGapsCm:gaps,cupTargetCm:cupTarget})
  }
}
