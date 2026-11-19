type GetOutstandingReportsParams = {
    /** Owner of the reports to list */
    ownerAccountID: number;

    /** Only list reports on this workspace. Leave it out to cover all of the owner's workspaces */
    policyID?: string;

    /** Number of reports to skip, for pagination */
    offset: number;
};

export default GetOutstandingReportsParams;
