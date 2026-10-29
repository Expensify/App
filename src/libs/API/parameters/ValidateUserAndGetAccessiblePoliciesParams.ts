type ValidateUserAndGetAccessiblePoliciesParams = {
    validateCode: string;

    /** Optimistic action ID for the "validate your email" onboarding task, so the CompleteTask Auth forwards reuses it */
    completedTaskReportActionID?: string;
};

export default ValidateUserAndGetAccessiblePoliciesParams;
