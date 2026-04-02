type DeletePolicyTaxesParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     * Each element is a tax name
     */
    taxNames: string;
    /** JSON-encoded array of auto-selected transaction updates when only one valid value remains. */
    transactionAutoSelections?: string;
};

export default DeletePolicyTaxesParams;
