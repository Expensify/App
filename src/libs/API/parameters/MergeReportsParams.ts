type MergeReportsParams = {
    destinationReportID: string;
    sourceReportIDs: string[];
    transactionIDToReportActionAndThreadData: string; // A map of transactionID to TransactionThreadInfo
};

export default MergeReportsParams;
