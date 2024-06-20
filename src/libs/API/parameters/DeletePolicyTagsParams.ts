type DeletePolicyTagsParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<string>
     */
    tags: string;
};

export default DeletePolicyTagsParams;
