/** Model of policy ownership change checks */
type PolicyOwnershipChangeChecks = {
    /** Whether the outstanding balance should be cleared after changing workspace owner */
    shouldClearOutstandingBalance?: boolean;

    /** Whether the amount owed should be transferred after changing workspace owner */
    shouldTransferAmountOwed?: boolean;

    /** Whether the subscription should be transferred after changing workspace owner */
    shouldTransferSubscription?: boolean;

    /** Whether the single subscription should be transferred after changing workspace owner */
    shouldTransferSingleSubscription?: boolean;
};

export default PolicyOwnershipChangeChecks;
