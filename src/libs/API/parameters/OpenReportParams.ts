type OpenReportParams = {
    reportID: string;
    emailList?: string;
    accountIDList?: string;
    parentReportActionID?: string;
    shouldRetry?: boolean;
    createdReportActionID?: string;
    clientLastReadTime?: string;
    idempotencyKey?: string;
};

export default OpenReportParams;
