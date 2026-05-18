type SyncPolicyToMergeHRParams = {
    /** The ID of the policy to sync */
    policyID: string;

    /** Deduplication key */
    idempotencyKey: string;
};

export default SyncPolicyToMergeHRParams;
