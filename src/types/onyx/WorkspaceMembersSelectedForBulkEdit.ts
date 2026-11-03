/** Members picked on a workspace member list for a bulk office location or work arrangement change */
type WorkspaceMembersSelectedForBulkEdit = {
    /** The workspace whose member list the members were picked from */
    policyID: string;

    /** The account IDs of the picked members */
    accountIDs: number[];
};

export default WorkspaceMembersSelectedForBulkEdit;
