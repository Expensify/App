type CreateWorkspaceReportFieldParams = {
    policyID: string | undefined;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     */
    reportFields: string;
};

export default CreateWorkspaceReportFieldParams;
