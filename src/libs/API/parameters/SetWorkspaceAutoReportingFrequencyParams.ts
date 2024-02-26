import type CONST from "@src/CONST";
import type { ValueOf } from "type-fest";

type SetWorkspaceAutoReportingFrequencyParams = {
    policyID: string;
    frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
};

export default SetWorkspaceAutoReportingFrequencyParams;
