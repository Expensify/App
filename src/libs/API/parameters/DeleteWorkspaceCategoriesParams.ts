type DeleteWorkspaceCategoriesParams = {
    policyID: string;
    /**
     * A JSON-encoded string representing an array of category names to be deleted.
     * Each element in the array is a string that specifies the name of a category.
     */
    categories: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default DeleteWorkspaceCategoriesParams;
