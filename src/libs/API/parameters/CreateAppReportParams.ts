type CreateAppReportParams = {
    reportName: string;
    policyID?: string;
    type: string;
    reportID: string;
    reportActionID: string;
    shouldUpdateQAB: boolean;
};
export default CreateAppReportParams;
