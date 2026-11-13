type PayViaABAParams = {
    /** Comma-separated IDs of the reports to pay */
    reportIDList: string;

    /** Whether held expenses are paid too, otherwise they're moved to a new report */
    shouldReimburseHeldTransactions: boolean;
};

export default PayViaABAParams;
