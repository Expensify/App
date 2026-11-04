type AddMembersToWorkspaceParams = {
    employees: string;
    welcomeNote: string;
    policyID: string;
    hasOfficeWorkArrangement?: boolean;
    reportCreationData?: string;
    announceChatReportID?: string;
    announceCreatedReportActionID?: string;
};

export default AddMembersToWorkspaceParams;
