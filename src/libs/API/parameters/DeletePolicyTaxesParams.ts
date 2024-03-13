type DeletePolicyTaxesParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     * Each element is a tax name
     */
    taxCodes: string;
};

export default DeletePolicyTaxesParams;
