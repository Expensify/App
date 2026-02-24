type SetPolicyTaxesEnabledParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{taxCode: string, enabled: bool}>
     */
    taxFieldsArray: string;
};

export default SetPolicyTaxesEnabledParams;
