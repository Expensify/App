type RemovePolicyCategoryReceiptsRequiredParams = {
    policyID: string;
    categoryName: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default RemovePolicyCategoryReceiptsRequiredParams;
