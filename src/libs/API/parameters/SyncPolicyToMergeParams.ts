import type {MergeConnectionName} from '@libs/merge/MergeUtils';

type SyncPolicyToMergeParams = {
    policyID: string;

    /** The Merge connection to sync (Merge HR or Merge ATS) */
    connectionName: MergeConnectionName;
};

export default SyncPolicyToMergeParams;
