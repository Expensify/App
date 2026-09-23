import type {MergeConnectionName} from '@libs/merge/MergeUtils';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateMergeApprovalModeParams = {
    policyID: string;

    /** The Merge connection to update (Merge HR or Merge ATS) */
    connectionName: MergeConnectionName;

    /** The new approval mode to apply to the Merge connection */
    approvalMode: ValueOf<typeof CONST.MERGE.APPROVAL_MODE>;
};

export default UpdateMergeApprovalModeParams;
