type SetPolicyTagsEnabled = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string; enabled: boolean}>
     */
    tags: string;
    /**
     * When the tags are imported as multi level tags, the index of the top
     * most tag list item
     */
    tagListIndex: number;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyTagsEnabled;
