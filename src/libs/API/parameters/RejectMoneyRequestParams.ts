type RejectMoneyRequestParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    movedToReportID?: string;
    removedFromReportActionID?: string;
    rejectedActionReportActionID: string;
    rejectedCommentReportActionID: string;
};

export default RejectMoneyRequestParams;
