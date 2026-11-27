/** The annual subscription the user takes over with a workspace, as the owner change asks them to confirm it */
type SubscriptionTransfer = {
    /** How many members the owner's annual subscription has */
    ownerUserCount: number;

    /** How many members the user's subscription has once it merges with the owner's */
    totalUserCount: number;

    /** When the merged subscription ends */
    endDate: string;
};

/** The workspaces of one owner the user can take over billing for together */
type BillingTakeoverPolicies = {
    /** IDs of the workspaces the user can take over billing for together */
    policyIDs?: string[];

    /** The workspaces whose transfer takes over the owner's annual subscription, keyed by policyID */
    subscriptionTransfers?: Record<string, SubscriptionTransfer>;

    /** Whether the check is still running */
    isLoading?: boolean;

    /** The owner change visit that asked for this check, so a later visit doesn't read an earlier answer */
    checkID?: string;
};

export default BillingTakeoverPolicies;
export type {SubscriptionTransfer};
