type CreatePerDiemRequestParams = {
    policyID: string;
    created: string;
    customUnitID: string;
    customUnitRate: string;
    customUnitRateID: string;
    subRates: string;
    currency: string;
    startDateTime: string;
    endDateTime: string;
    category?: string;
    description: string;
    tag?: string;
    iouReportID?: string;
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewReportActionID: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread: string | undefined;
    billable?: boolean;
    reimbursable?: boolean;
    attendees?: string;
};

export default CreatePerDiemRequestParams;
