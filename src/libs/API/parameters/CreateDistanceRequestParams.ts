type CreateDistanceRequestParams = {
    transactionID: string;
    chatReportID: string;
    createdChatReportActionID: string;
    reportActionID: string;
    waypoints: string;
    customUnitRateID: string;
    comment: string;
    created: string;
    iouReportID?: string;
    createdIOUReportActionID?: string;
    reportPreviewReportActionID?: string;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
    payerEmail?: string;
    splits?: string;
    chatType?: string;
};

export default CreateDistanceRequestParams;
