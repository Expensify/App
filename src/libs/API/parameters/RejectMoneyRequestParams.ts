type RejectMoneyRequestParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    rejectedToReportID?: string;
    rejectedActionReportActionID: string;
    rejectedCommentReportActionID: string;
};

export default RejectMoneyRequestParams;
