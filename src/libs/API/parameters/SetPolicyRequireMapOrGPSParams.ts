type SetPolicyRequireMapOrGPSParams = {
    policyID: string;

    /** When true, only map and GPS distance expenses are allowed on the workspace */
    enabled: boolean;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyRequireMapOrGPSParams;
