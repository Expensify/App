type CreateWorkspaceReportFieldParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     */
    reportFields: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default CreateWorkspaceReportFieldParams;
