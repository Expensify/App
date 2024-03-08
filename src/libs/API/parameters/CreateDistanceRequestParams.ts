type CreateDistanceRequestParams = {
    comment: string;
    iouReportID: string;
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    createdChatReportActionID: string;
    createdIOUReportActionID: string;
    reportPreviewReportActionID: string;
    waypoints: string;
    created: string;
    category?: string;
    tag?: string;
    billable?: boolean;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
    payerEmail: string;
    customUnitRateID?: string;
};

export default CreateDistanceRequestParams;
