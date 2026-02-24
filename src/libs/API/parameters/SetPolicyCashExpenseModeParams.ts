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
};

export default SetPolicyCashExpenseModeParams;
