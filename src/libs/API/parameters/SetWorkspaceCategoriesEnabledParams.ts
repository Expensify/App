type SetWorkspaceCategoriesEnabledParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string; enabled: boolean}>
     */
    categories: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetWorkspaceCategoriesEnabledParams;
