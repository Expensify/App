import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateMergeApprovalModeParams = {
    /** The ID of the policy to update */
    policyID: string;

    /** The new approval mode to apply to the Merge HR connection */
    approvalMode: ValueOf<typeof CONST.MERGE_HR.APPROVAL_MODE>;
};

export default UpdateMergeApprovalModeParams;
