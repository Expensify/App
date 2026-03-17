type SetPolicyProhibitedExpensesParams = {
    policyID: string;
    /**
     * A JSON string representing the prohibited expenses
     *
     * e.g. {'alcohol': true, 'gambling': true, 'hotelIncidentals': true, 'tobacco': true}
     */
    prohibitedExpenses: string;
};

export default SetPolicyProhibitedExpensesParams;
