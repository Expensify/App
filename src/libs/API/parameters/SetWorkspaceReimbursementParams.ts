import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SetWorkspaceReimbursementParams = {
    policyID: string;
    reimbursementChoice: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;
    bankAccountID?: number;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetWorkspaceReimbursementParams;
