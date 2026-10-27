type SetPolicyMemberCategoryVisibilityParams = {
    policyID: string;

    /** A JSON-encoded array of the account IDs of the members whose category visibility is being set */
    accountIDs: string;

    /** A JSON-encoded array of the names of the categories the members can use */
    categories: string;
};

export default SetPolicyMemberCategoryVisibilityParams;
