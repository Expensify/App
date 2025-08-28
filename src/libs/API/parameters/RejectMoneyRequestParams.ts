type RejectMoneyRequestParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    rejectedReportID?: string;
    removedFromReportActionID?: string;
    rejectedActionReportActionID: string;
    rejectedCommentReportActionID: string;
};

export default RejectMoneyRequestParams;
