type RejectMoneyRequestParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    rejectedToReportID?: string;
    reportPreviewReportActionID?: string;
    rejectedActionReportActionID: string;
    rejectedCommentReportActionID: string;
};

export default RejectMoneyRequestParams;
