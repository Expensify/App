type UpdateWorkspaceReportFieldParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<PolicyReportField>
     */
    reportFields: string;
};

export default UpdateWorkspaceReportFieldParams;
