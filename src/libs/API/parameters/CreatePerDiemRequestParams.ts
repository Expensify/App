type CreatePerDiemRequestParams = {
    policyID: string;
    created: string;
    customUnitID: string;
    customUnitRateID: string;
    subRates: string;
    currency: string;
    startTime: string;
    endTime: string;
    category?: string;
    description: string;
    tag?: string;
    iouReportID: string;
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    createdChatReportActionID: string;
    createdIOUReportActionID: string;
    reportPreviewReportActionID: string;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
};

export default CreatePerDiemRequestParams;
