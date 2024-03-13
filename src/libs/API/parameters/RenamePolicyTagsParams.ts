type RenamePolicyTagsParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * {[oldName: string]: string;} where value is new tag name
     */
    tags: string;
};

export default RenamePolicyTagsParams;
