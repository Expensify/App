type SetPolicyTagsRequired = {
    policyID: string;
    /**
     * When the tags are imported as multi level tags, the index of the top
     * most tag list item
     */
    tagListIndex?: number;
    requireTagList: boolean;
};

export default SetPolicyTagsRequired;
