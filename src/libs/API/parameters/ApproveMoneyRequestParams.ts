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
    /**
     * Stringified JSON object of type Record<string, string> with the following structure:
     * {
     *   [oldReportActionID]: optimisticReportActionID,
     * }
     * where optimisticReportActionID is the optimistic report action ID and oldReportActionID is the old report action ID
     */
    optimisticReportActionCopyIDs?: string;

    /** The optimistic action ID for the report created for unapproved transactions */
    optimisticCreatedReportForUnapprovedTransactionsActionID?: string;
};

export default ApproveMoneyRequestParams;
