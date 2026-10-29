import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SetWorkspaceAutoReportingFrequencyParams = {
    policyID: string;
    frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetWorkspaceAutoReportingFrequencyParams;
