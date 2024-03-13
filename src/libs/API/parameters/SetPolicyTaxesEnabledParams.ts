type SetPolicyTaxesEnabledParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{taxCode: string, enabled: bool}>
     */
    taxFields: string;
};

export default SetPolicyTaxesEnabledParams;
