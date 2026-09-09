type CreateAppReportParams = {
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    reportPreviewReportActionID: string;
    ownerEmail?: string;
    managedCardTransactionID?: string;
    shouldDismissEmptyReportsConfirmation?: boolean;
    reportName?: string;
};
export default CreateAppReportParams;
