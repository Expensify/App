type CompleteEngagementModalParams = {
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    engagementChoice: string;
    timezone?: string;
};

export default CompleteEngagementModalParams;
