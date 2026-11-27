/** Categories picked on a workspace's category list for a bulk visibility change */
type WorkspaceCategoriesSelectedForBulkEdit = {
    /** The workspace whose category list the categories were picked from */
    policyID: string;

    /** Only the enabled ones among the picked categories, since the server rejects visibility changes on disabled categories */
    categoryNames: string[];
};

export default WorkspaceCategoriesSelectedForBulkEdit;
