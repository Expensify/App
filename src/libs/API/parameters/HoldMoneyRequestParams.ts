type HoldMoneyRequestParams = {
    transactionID: string;
    comment: string;
    reportActionID: string;
    commentReportActionID: string;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
};

export default HoldMoneyRequestParams;
