type ChangeTransactionsReportParams = {
    transactionList: string;
    reportID: string;
    reportActionIDToThreadReportIDMap: Record<string, string>; // A map linking the optimistic MOVEDTRANSACTION or UNREPORTEDTRANSACTION reportActionID to the transaction thread reportID.
};
export default ChangeTransactionsReportParams;
