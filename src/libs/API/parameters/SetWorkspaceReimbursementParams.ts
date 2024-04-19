import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SetWorkspaceReimbursementParams = {
    policyID: string;
    reimbursementChoice: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;
};

export default SetWorkspaceReimbursementParams;
