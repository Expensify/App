type PolicyOwnershipChangeChecks = {
    shouldClearOutstandingBalance?: boolean;
    shouldTransferAmountOwed?: boolean;
    shouldTransferSubscription?: boolean;
    shouldTransferSingleSubscription?: boolean;
};

export default PolicyOwnershipChangeChecks;
