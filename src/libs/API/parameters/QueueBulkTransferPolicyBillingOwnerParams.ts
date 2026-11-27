type QueueBulkTransferPolicyBillingOwnerParams = {
    /** CSV list of the workspace IDs to take over billing for */
    policyIDList: string;

    /** Whether the user confirmed taking over the owner's annual subscription with the last workspace */
    shouldTransferSubscription: boolean;
};

export default QueueBulkTransferPolicyBillingOwnerParams;
