type SetPolicyTagsEnabled = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string; enabled: boolean}>
     */
    tags: string;
};

export default SetPolicyTagsEnabled;
