import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {CONTRACTS, PART_NAMES} from "../Scripts/IncenseBallSceneContracts"
import {fixture, takeApart, target} from "./IncenseBallLeafFixture"
import {assertPose, check, evidence, object, pose, rotationError, tiltDegrees, until} from "./IncenseBallLeafGeometry"

/** Criterion 5: save a rolled pose, reassemble from inspection, roll again. */
@component
export class IncenseBallReassemblyScenario extends Scenario {
  async run(): Promise<void> {
    const f=await fixture()
    await f.hand.rollUntil(target(CONTRACTS.ball),new vec3(0.2,0,0.1),()=>tiltDegrees(f.visuals[0])>100)
    const saved=f.visuals.map(pose), ballBefore=pose(object(CONTRACTS.ball))
    await takeApart(f)
    await f.hand.pinch(target(PART_NAMES[4]))
    await until(()=>f.state().selected===4 && !f.state().selectionBusy,1200,"Cup inspection failed")
    const start=getTime()
    await f.hand.pinch(target(CONTRACTS.button))
    await until(()=>f.state().phase==="assembled",4100,"Put together did not complete after returning inspected cup")
    f.visuals.forEach((visual,i)=>assertPose(visual,saved[i]))
    assertPose(object(CONTRACTS.ball),ballBefore)
    check(f.state().selected===-1 && !f.state().ui.cardVisible && !f.state().ui.tagsVisible,"Assembly must close all inspection content")
    check(f.state().ui.buttonLabel==="Take apart","Action must return to Take apart")
    const restored=pose(f.visuals[0])
    await f.hand.rollUntil(target(CONTRACTS.ball),new vec3(-0.2,0,0),()=>rotationError(restored.rotation,pose(f.visuals[0]).rotation)>20)
    check(rotationError(restored.rotation,pose(f.visuals[0]).rotation)>15,"Reassembled ball cannot roll")
    check(tiltDegrees(f.visuals[4])<=5,"Cup must remain level after reassembly and another roll")
    evidence("criterion-5",{restoredParts:PART_NAMES,restoredPositionToleranceCm:0.05,
      restoredRotationToleranceDeg:0.1,reassembledAndRolled:true,elapsedSeconds:getTime()-start})
  }
}
