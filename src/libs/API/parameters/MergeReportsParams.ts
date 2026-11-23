type MergeReportsParams = {
    reportID: string;
    sourceReportIDList: string[];
    transactionIDToReportActionAndThreadData: string; // A map of transactionID to TransactionThreadInfo
    mergedReportsReportActionID: string;
};

export default MergeReportsParams;
