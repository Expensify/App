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
};

export default SetPolicyBillableModeParams;
