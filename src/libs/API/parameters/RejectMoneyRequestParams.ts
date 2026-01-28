type RejectMoneyRequestParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    rejectedToReportID?: string;
    reportPreviewReportActionID?: string;
    rejectedActionReportActionID: string;
    rejectedCommentReportActionID: string;
    createdIOUReportActionID?: string;
    expenseMovedReportActionID?: string;
    expenseCreatedReportActionID?: string;
};

export default RejectMoneyRequestParams;
