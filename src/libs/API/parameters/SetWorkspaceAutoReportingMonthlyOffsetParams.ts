type SetWorkspaceAutoReportingMonthlyOffsetParams = {
    policyID: string;
    value: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetWorkspaceAutoReportingMonthlyOffsetParams;
