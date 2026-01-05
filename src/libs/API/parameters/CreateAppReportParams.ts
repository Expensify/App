type CreateAppReportParams = {
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    reportPreviewReportActionID: string;
    shouldDismissEmptyReportsConfirmation?: boolean;
};
export default CreateAppReportParams;
