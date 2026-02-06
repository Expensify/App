type DeleteWorkspaceParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * {
     *   [reportID]: optimisticReportActionID;
     * }>
     */
    reportIDToOptimisticCloseReportActionID: string;
};

export default DeleteWorkspaceParams;
