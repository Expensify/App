type RejectExpenseReportParams = {
    reportID: string;
    targetAccountID: number;
    comment: string;
    rejectedReportActionID: string;
    rejectedCommentReportActionID: string;
};

export default RejectExpenseReportParams;
