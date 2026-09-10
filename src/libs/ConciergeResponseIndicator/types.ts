type TrackConciergeResponseParams = {
    accountID: number;
    reportID: string;
    questionReportActionID: string;
    responseReportActionID: string;
    responseReportID?: string;
};

type TrackConciergeResponse = (parameters: TrackConciergeResponseParams) => void;

export default TrackConciergeResponse;
export type {TrackConciergeResponseParams};
