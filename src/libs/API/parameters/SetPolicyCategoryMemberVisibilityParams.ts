type SetPolicyCategoryMemberVisibilityParams = {
    policyID: string;

    /** A JSON-encoded array of the names of the categories being changed */
    categoryNames: string;

    /** A JSON-encoded array of the account IDs of the members who can use the categories */
    selectedAccountIDList: string;

    /** A JSON-encoded array of the account IDs of the members who can't use the categories. When it holds every member, the categories are disabled */
    deselectedAccountIDList: string;
};

export default SetPolicyCategoryMemberVisibilityParams;
