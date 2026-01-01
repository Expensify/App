type CreateAppReportParams = {
    // Pass reportName only if it's a custom user defined name
    reportName?: string;
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    reportPreviewReportActionID: string;
    shouldDismissEmptyReportsConfirmation?: boolean;
};
export default CreateAppReportParams;
