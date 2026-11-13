type RenamePolicyTagListParams = {
    policyID: string;
    oldName: string;
    newName: string;
    tagListIndex: number;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default RenamePolicyTagListParams;
