type SetPolicyTagsEnabled = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string; enabled: boolean}>
     */
    tags: string;
    /**
     * When the tags are imported as multi level tags, the index of the top
     * most tag list item
     */
    tagListIndex: number;
};

export default SetPolicyTagsEnabled;
