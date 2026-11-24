type UpdatePolicyTaxValueParams = {
    policyID: string;
    taxCode: string;
    // String in the format: "1.1234%"
    taxRate: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default UpdatePolicyTaxValueParams;
