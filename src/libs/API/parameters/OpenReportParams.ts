type OpenReportParams = {
    reportID: string;
    reportActionID?: string;
    emailList?: string;
    accountIDList?: string;
    parentReportActionID?: string;
    shouldRetry?: boolean;
    createdReportActionID?: string;
    clientLastReadTime?: string;
<<<<<<< HEAD
    idempotencyKey?: string;
=======
    groupChatAdminLogins?: string;
    reportName?: string;
    chatType?: string;
    optimisticAccountIDList?: string;
>>>>>>> 3f3869a (Merge pull request #39024 from Expensify/Rory-GenericConflictingRequests)
};

export default OpenReportParams;
