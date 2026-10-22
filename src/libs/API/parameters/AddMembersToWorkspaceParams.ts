type AddMembersToWorkspaceParams = {
    employees: string;
    welcomeNote: string;
    policyID: string;
    hasOfficeWorkArrangement?: boolean;

    /** Whether the invited members can book travel. Omitted, the workspace setting for new members decides. */
    canUseTravel?: boolean;
    reportCreationData?: string;
    announceChatReportID?: string;
    announceCreatedReportActionID?: string;
};

export default AddMembersToWorkspaceParams;
