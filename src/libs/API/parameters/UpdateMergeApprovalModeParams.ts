import type {MergeConnectionName} from '@libs/merge/MergeUtils';

import type {MergeApprovalMode, MergeATSApproverField} from '@src/types/onyx/Policy';

type UpdateMergeApprovalModeParams = {
    policyID: string;

    /** The Merge connection to update (Merge HR or Merge ATS) */
    connectionName: MergeConnectionName;

    /** The new approval mode to apply to the Merge connection */
    approvalMode: MergeApprovalMode;

    /** Merge ATS only: the ATS field the default approver is read from. Only sent in the modes that use it. */
    approverField?: MergeATSApproverField;

    /** Merge ATS only: login of the member who acts as the final approver. Only sent in the modes that use it. */
    finalApprover?: string;
};

export default UpdateMergeApprovalModeParams;
