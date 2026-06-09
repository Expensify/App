type UpdateMergeGroupsParams = {
    /** The ID of the policy to update. */
    policyID: string;

    /** The Merge group ids to import employees from. An empty array syncs all employees regardless of group. */
    groups: string[];
};

export default UpdateMergeGroupsParams;
