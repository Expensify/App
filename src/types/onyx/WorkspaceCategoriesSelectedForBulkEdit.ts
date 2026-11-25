/** Categories picked on a workspace's category list for a bulk visibility change */
type WorkspaceCategoriesSelectedForBulkEdit = {
    /** The workspace whose category list the categories were picked from */
    policyID: string;

    /** The names of the picked categories */
    categoryNames: string[];
};

export default WorkspaceCategoriesSelectedForBulkEdit;
