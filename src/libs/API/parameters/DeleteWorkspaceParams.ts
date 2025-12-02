type DeleteWorkspaceParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * {
     *   [reportID]: optimisticReportActionID;
     * }>
     */
    optimisticReportActions: string;
};

export default DeleteWorkspaceParams;
