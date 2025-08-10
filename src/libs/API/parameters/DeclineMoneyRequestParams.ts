type DeclineMoneyRequestParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    movedToReportID?: string;
    removedFromReportActionID: string;
    declinedActionReportActionID: string;
    declinedCommentReportActionID: string;
};

export default DeclineMoneyRequestParams;
