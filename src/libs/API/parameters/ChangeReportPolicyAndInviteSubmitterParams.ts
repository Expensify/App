type ChangeReportPolicyParams = {
    reportID: string;
    policyID: string;
    reportPreviewReportActionID: string;
    changePolicyReportActionID: string;
    distanceRateUpdatedReportActionID?: string;
    /** Serialized transaction IDs mapped to modified-expense and optional new-thread IDs. */
    transactionIDToReportActionAndThreadData?: string;
    policyExpenseChatReportID: string;
    policyExpenseCreatedReportActionID?: string;
};
export default ChangeReportPolicyParams;
