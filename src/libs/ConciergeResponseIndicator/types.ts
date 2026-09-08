type TrackConciergeResponse = (parameters: {
    accountID: number;
    reportID: string;
    questionReportActionID: string;
    responseReportActionID: string;
    responseReportID?: string;
    shouldShowPending?: boolean;
}) => void;

export default TrackConciergeResponse;
