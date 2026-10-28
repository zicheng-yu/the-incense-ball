import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {withTimeout} from "Leaf.lspkg/Utils/common/Utils"
import {CONTRACTS} from "../Scripts/IncenseBallSceneContracts"
import {fixture, target} from "./IncenseBallLeafFixture"
import {check, evidence, until} from "./IncenseBallLeafGeometry"

/** Supplementary reach test. Disable LEAF's default simulated-input fallback. */
@component
export class IncenseBallReachScenario extends Scenario {
  async run(): Promise<void> {
    const f=await fixture()
    const ik=createIKInteractor({body:{fallback:undefined},avatar:{debugOverlay:false}})
    await withTimeout(ik.ready,15000,"IK avatar did not become ready")
    const button=target(CONTRACTS.button)
    const indirect=ik.right.isIndirect(button)
    evidence("ik-routing",{button:CONTRACTS.button,routing:indirect?"far-field":"direct",fallback:false})
    await withTimeout(ik.trigger(button),15000,"IK hand could not operate the stand button")
    await until(()=>f.state().phase==="exploded",3500,"IK pinch did not take apart the exhibit")
    check(!indirect,"Stand button used far-field routing; direct reach is not proven from this starting position")
    evidence("ik-reach",{buttonTriggered:true,directReach:true,fallback:false})
  }
}
