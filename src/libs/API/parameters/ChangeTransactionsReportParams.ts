type TransactionThreadInfo = {
    transactionThreadReportID?: string;
    transactionThreadCreatedReportActionID?: string;
    movedReportActionID: string;
};

type ChangeTransactionsReportParams = {
    transactionList: string;
    reportID: string;
    transactionIDToReportActionAndThreadData: Record<string, TransactionThreadInfo>; // A map of transactionID to TransactionThreadInfo
};

export default ChangeTransactionsReportParams;
export type {TransactionThreadInfo};
