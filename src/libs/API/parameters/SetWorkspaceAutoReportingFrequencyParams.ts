import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SetWorkspaceAutoReportingFrequencyParams = {
    policyID: string;
    frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
};

export default SetWorkspaceAutoReportingFrequencyParams;
