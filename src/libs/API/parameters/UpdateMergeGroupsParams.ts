import type CONST from '@src/CONST';

type UpdateMergeGroupsParams = {
    /** The ID of the policy to update */
    policyID: string;

    /** Either the Merge group ids the admin chose, or the `"all"` string literal to sync employees from every group. */
    groups: string[] | typeof CONST.MERGE_HR.GROUPS_ALL;
};

export default UpdateMergeGroupsParams;
