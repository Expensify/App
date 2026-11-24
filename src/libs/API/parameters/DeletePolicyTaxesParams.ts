type DeletePolicyTaxesParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     * Each element is a tax name
     */
    taxNames: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default DeletePolicyTaxesParams;
