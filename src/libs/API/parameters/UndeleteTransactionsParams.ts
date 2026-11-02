type UndeleteTransactionsParams = {
    transactionList: string;

    // A JSON map from transactionID to TransactionThreadInfo. Reuses the same thread/preview
    // optimistic IDs plumbing as ChangeTransactionsReport so the server can keep the thread
    // and preview actions in sync.
    transactionIDToReportActionAndThreadData: string;
};

export default UndeleteTransactionsParams;
