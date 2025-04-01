type CreateAppReportParams = {
    reportName: string;
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    reportPreviewReportActionID: string;
    shouldUpdateQAB: boolean;
};
export default CreateAppReportParams;
