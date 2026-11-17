type RenameWorkspaceCategoriesParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * {[oldName: string]: string;} where value is new category name
     */
    categories: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default RenameWorkspaceCategoriesParams;
