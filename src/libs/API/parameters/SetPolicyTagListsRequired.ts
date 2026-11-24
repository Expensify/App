type SetPolicyTagListsRequired = {
    policyID: string;
    tagListIndexes: number[];
    isRequired: boolean;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyTagListsRequired;
