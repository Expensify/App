type UpdateMergeGroupsParams = {
    /** The ID of the policy to update. */
    policyID: string;

    /** The Merge group ids to import employees from. */
    groups: string[];
};

export default UpdateMergeGroupsParams;
