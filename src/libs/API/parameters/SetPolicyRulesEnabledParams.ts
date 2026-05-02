type SetPolicyRulesEnabledParams = {
    policyID: string;
    enabled: boolean;
    /**
     * Stringified JSON object with type of following structure:
     *  disabledFields: {
     *      defaultBillable: boolean;
     *  };
     */
    disabledFields?: string;
};

export default SetPolicyRulesEnabledParams;
