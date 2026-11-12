type JoinAccessiblePolicyParams = {
    policyID: string;

    /** Optimistic action ID for the "join workspace" onboarding task, so the CompleteTask Auth forwards reuses it */
    completedTaskReportActionID?: string;
};

export default JoinAccessiblePolicyParams;
