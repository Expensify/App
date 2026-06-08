type RejectExpenseReportParams = {
    reportID: string;
    targetAccountID: number;
    comment: string;
    rejectedActionReportActionID: string;
    rejectedCommentReportActionID: string;
};

export default RejectExpenseReportParams;
