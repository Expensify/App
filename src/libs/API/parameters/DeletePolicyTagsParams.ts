type DeletePolicyTagsParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     */
    tags: string;
    /** JSON-encoded array of auto-selected transaction updates when only one valid value remains. */
    transactionAutoSelections?: string;
};

export default DeletePolicyTagsParams;
