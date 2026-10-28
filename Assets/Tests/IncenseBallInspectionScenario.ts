import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {CARD_COPY, CONTRACTS, PART_NAMES} from "../Scripts/IncenseBallSceneContracts"
import {fixture, takeApart, target} from "./IncenseBallLeafFixture"
import {assertInView, bounds, check, evidence, object, pose, rotationError, until} from "./IncenseBallLeafGeometry"

/** Criterion 4: every part, repeat pinch, switching, dimming, exact card copy. */
@component
export class IncenseBallInspectionScenario extends Scenario {
  async run(): Promise<void> {
    const f=await fixture()
    await takeApart(f)
    const rests=f.visuals.map(pose), colors=f.state().parts.map(p=>p.color.x)
    const checked:string[]=[]
    for (let i=0;i<5;i++) {
      await f.hand.pinch(target(PART_NAMES[i]))
      await until(()=>f.state().selected===i && !f.state().selectionBusy,1200,`${PART_NAMES[i]} did not come forward`)
      const p=pose(f.visuals[i])
      check(Math.abs(p.scale.x-1)<0.001, `${PART_NAMES[i]} inspection must be full size`)
      check(Math.abs(p.position.z-rests[i].position.z-20)<=0.5, `${PART_NAMES[i]} must move about twenty centimeters toward viewer`)
      check(f.state().ui.cardVisible, "Inspection card is not visible")
      check((object("Incense Card Title").getComponent("Component.Text") as Text).text===PART_NAMES[i], "Wrong card title")
      check((object("Incense Card Copy").getComponent("Component.Text") as Text).text===CARD_COPY[i], "Card copy differs from brief")
      const state=f.state()
      check(state.parts[i].color.x>colors[i]+0.01, "Selected part must brighten")
      state.parts.forEach((part,j)=>{if(j!==i)check(part.color.x<colors[j]*0.65, "Other parts must dim")})
      assertInView(f.camera,bounds(f.parts[i]),`${PART_NAMES[i]} full-size inspection`)
      assertInView(f.camera,bounds(object(CONTRACTS.card)),"Inspection card")
      assertInView(f.camera,bounds(object(CONTRACTS.button)),"Inspection action button")
      await sleep(600)
      check(rotationError(p.rotation,pose(f.visuals[i]).rotation)>2, "Inspected part must slowly turn")
      assertInView(f.camera,bounds(f.parts[i]),`${PART_NAMES[i]} turning inspection`)
      await f.hand.pinch(target(PART_NAMES[i]))
      await until(()=>f.state().selected===-1 && !f.state().selectionBusy,1200,"Second pinch did not return part")
      check(!f.state().ui.cardVisible,"Returning the selected part must close its card")
      const returned=pose(f.visuals[i])
      check(returned.position.distance(rests[i].position)<0.05 && returned.scale.distance(rests[i].scale)<0.001,
        "Part did not return to its half-size display position")
      check(rotationError(returned.rotation,rests[i].rotation)<0.1,"Part did not restore its display orientation")
      checked.push(PART_NAMES[i])
    }
    await f.hand.pinch(target(PART_NAMES[0]))
    await until(()=>!f.state().selectionBusy,1200,"First selection never settled")
    await f.hand.pinch(target(PART_NAMES[3]))
    await until(()=>f.state().selected===3 && !f.state().selectionBusy,1800,"Selection switching failed")
    check(pose(f.visuals[0]).position.distance(rests[0].position)<0.05,"Previous selection must return before next comes forward")
    check(f.state().parts.filter(p=>Math.abs(p.scale-1)<0.01).length===1,"Only one part may be full-size for inspection")
    evidence("criterion-4",{inspectedAndReturned:checked,selectionSwitch:"Shell half 1 → Inner ring",cardCopy:"exact"})
  }
}
