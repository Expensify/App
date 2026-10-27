type SetPolicyBillableModeParams = {
    policyID: string;
    defaultBillable: boolean;
    /**
     * Stringified JSON object with type of following structure:
     *  disabledFields: {
     *      defaultBillable: boolean;
     *  };
     */
    disabledFields: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyBillableModeParams;
