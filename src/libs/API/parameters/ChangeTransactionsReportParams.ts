/**
 * A map linking the optimistic MOVEDTRANSACTION or UNREPORTEDTRANSACTION reportActionID to the transactionID.
 * If we're creating the transactionThread as part of moving the transaction, we should also send the optimistic
 * transactionThreadReportID and transactionThreadCreatedReportActionID
 */
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
