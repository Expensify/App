type CreateAppReportParams = {
    reportName: string;
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    reportPreviewReportActionID: string;
    reportCreatorEmail?: string;
};
export default CreateAppReportParams;
