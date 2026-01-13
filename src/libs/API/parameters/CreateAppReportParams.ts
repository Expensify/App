type CreateAppReportParams = {
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    reportPreviewReportActionID: string;
    reportCreatorEmail?: string;
    shouldDismissEmptyReportsConfirmation?: boolean;
};
export default CreateAppReportParams;
