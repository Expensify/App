import type {MergeConnectionName} from '@libs/merge/MergeUtils';

type UpdateMergeFinalApproverParams = {
    /** The ID of the policy to update */
    policyID: string;

    /** The Merge connection to update (Merge HR or Merge ATS) */
    connectionName: MergeConnectionName;

    /** Login of the member who will act as the final approver, or null to clear */
    finalApprover: string | null;
};

export default UpdateMergeFinalApproverParams;
