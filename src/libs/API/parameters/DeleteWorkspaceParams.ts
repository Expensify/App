type DeleteWorkspaceParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * {
     *   [reportID]: optimisticReportActionID;
     * }>
     */
    reportIDToOptimisticClosedReportActionID: string;
};

export default DeleteWorkspaceParams;
