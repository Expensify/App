type ChangeTransactionsReportParams = {
    transactionList: string;
    reportID: string;
    transactionIDToReportActionAndThreadData: {
        transactionID: {
            movedReportActionID: string;
            transactionThreadReportID?: string;
            transactionThreadCreatedReportActionID?: string;
        };
    };
};

export default ChangeTransactionsReportParams;
