type ApproveMoneyRequestParams = {
    reportID: string;
    approvedReportActionID: string;
    full?: boolean;
    optimisticHoldReportID?: string;
    optimisticHoldActionID?: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{
     *   optimisticReportActionID: string;
     *   oldReportActionID: string;
     * }>
     */
    optimisticHoldReportExpenseActionIDs?: string;

    /** The optimistic action ID for the report created for unapproved transactions */
    optimisticCreatedReportForUnapprovedTransactionsActionID?: string;
};

export default ApproveMoneyRequestParams;
