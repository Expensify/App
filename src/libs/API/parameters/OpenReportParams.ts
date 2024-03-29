type OpenReportParams = {
    reportID: string;
    reportActionID?: string;
    emailList?: string;
    accountIDList?: string;
    parentReportActionID?: string;
    shouldRetry?: boolean;
    createdReportActionID?: string;
    clientLastReadTime?: string;
    groupChatAdminLogins?: string;
    reportName?: string;
    chatType?: string;
    optimisticAccountIDList?: string;
};

export default OpenReportParams;
