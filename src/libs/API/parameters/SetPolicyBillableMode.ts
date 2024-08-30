type SetPolicyBillableMode = {
    defaultBillable: boolean;
    /**
     * Stringified JSON object with type of following structure:
     *  disabledFields: {
     *      defaultBillable: boolean;
     *  };
     */
    disabledFields: string;
};

export default SetPolicyBillableMode;
