type SetPolicyCategoryTaxParams = {
    policyID: string;
    categoryName: string;
    taxID: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyCategoryTaxParams;
