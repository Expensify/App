type DeleteWorkspaceParams = {
    policyID: string;

    // map of reportID => optimistic reportActionID of the CLOSED action for that report
    closedReportActions: Record<string, string>;
};

export default DeleteWorkspaceParams;
