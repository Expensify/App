type MergeReportsParams = {
    reportID: string;
    sourceReportIDList: string[];
    transactionIDToReportActionAndThreadData: string; // A map of transactionID to TransactionThreadInfo
};

export default MergeReportsParams;
