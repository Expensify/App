type AddMembersToWorkspaceParams = {
    employees: string;
    welcomeNote: string;
    policyID: string | undefined;
    reportCreationData?: string;
    announceChatReportID?: string;
    announceCreatedReportActionID?: string;
};

export default AddMembersToWorkspaceParams;
