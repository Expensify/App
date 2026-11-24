type AddMembersToWorkspaceParams = {
    employees: string;
    welcomeNote: string;
    policyID: string;
    hasOfficeWorkArrangement?: boolean;

    /** The inviter's travel choice when it differs from the workspace's new member travel setting. Omitted, the setting decides. The server never stores true. */
    canUseTravel?: boolean;
    reportCreationData?: string;
    announceChatReportID?: string;
    announceCreatedReportActionID?: string;
};

export default AddMembersToWorkspaceParams;
