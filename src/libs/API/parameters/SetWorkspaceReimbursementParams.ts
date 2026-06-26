import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SetWorkspaceReimbursementParams = {
    policyID: string;
    reimbursementChoice: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;
    bankAccountID?: number;
};

export default SetWorkspaceReimbursementParams;
