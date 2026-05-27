type SubmitReportParams = {
    reportID: string;
    managerAccountID?: number;
    reportActionID: string;
    optimisticHoldReportID?: string;
    optimisticHoldActionID?: string;
    optimisticHoldReportExpenseActionIDs?: string;
    optimisticReportActionCopyIDs?: string;
    optimisticCreatedReportForUnapprovedTransactionsActionID?: string;
};

export default SubmitReportParams;
