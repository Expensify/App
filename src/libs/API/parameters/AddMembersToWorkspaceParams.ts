type AddMembersToWorkspaceParams = {
    employees: string;
    welcomeNote: string;
    policyID: string;
    hasOfficeWorkArrangement?: boolean;
    /** A JSON-encoded array of the only categories the invited members can use. Left out, they can use every category */
    categoryNames?: string;
    reportCreationData?: string;
    announceChatReportID?: string;
    announceCreatedReportActionID?: string;
};

export default AddMembersToWorkspaceParams;
