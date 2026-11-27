type SetPolicyCashExpenseModeParams = {
    policyID: string;
    defaultReimbursable: boolean;
    /**
     * Stringified JSON object with type of following structure:
     *  disabledFields: {
     *      reimbursable: boolean;
     *  };
     */
    disabledFields: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyCashExpenseModeParams;
