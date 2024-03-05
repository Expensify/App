type OpenReportParams = {
    reportID: string;
    emailList?: string;
    accountIDList?: string;
    parentReportActionID?: string;
    shouldRetry?: boolean;
    createdReportActionID?: string;
    clientLastReadTime?: string;
    idempotencyKey?: string;
    groupChatAdminLogins?: string;
    reportName?: string;
    chatType?: string;
    optimisticAccountIDList?: string;
};

export default OpenReportParams;
