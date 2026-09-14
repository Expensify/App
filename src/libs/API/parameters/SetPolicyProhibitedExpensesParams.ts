type SetPolicyProhibitedExpensesParams = {
    policyID: string;
    /**
     * A JSON string representing the prohibited expenses
     *
     * e.g. {'alcohol': true, 'gambling': true, 'hotelIncidentals': true, 'tobacco': true}
     */
    prohibitedExpenses: string;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyProhibitedExpensesParams;
