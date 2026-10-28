import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {IncenseBallStartScenario} from "./IncenseBallStartScenario"
import {IncenseBallRollScenario} from "./IncenseBallRollScenario"
import {IncenseBallDisassemblyScenario} from "./IncenseBallDisassemblyScenario"
import {IncenseBallInspectionScenario} from "./IncenseBallInspectionScenario"
import {IncenseBallReassemblyScenario} from "./IncenseBallReassemblyScenario"
import {IncenseBallReachScenario} from "./IncenseBallReachScenario"

@component
export class IncenseBallLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:"incense-criterion-1-start",typename:IncenseBallStartScenario.getTypeName(),parameters:{__leaf__timeout_secs:"30"}},
    {id:"incense-criterion-2-roll-level",typename:IncenseBallRollScenario.getTypeName(),parameters:{__leaf__timeout_secs:"40"}},
    {id:"incense-criterion-3-take-apart",typename:IncenseBallDisassemblyScenario.getTypeName(),parameters:{__leaf__timeout_secs:"30"}},
    {id:"incense-criterion-4-inspect",typename:IncenseBallInspectionScenario.getTypeName(),parameters:{__leaf__timeout_secs:"60"}},
    {id:"incense-criterion-5-put-together",typename:IncenseBallReassemblyScenario.getTypeName(),parameters:{__leaf__timeout_secs:"40"}},
    {id:"incense-ik-stand-button",typename:IncenseBallReachScenario.getTypeName(),parameters:{__leaf__timeout_secs:"45"}},
  ]
}
