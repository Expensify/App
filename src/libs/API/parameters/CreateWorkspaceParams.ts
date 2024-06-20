type CreateWorkspaceParams = {
    policyID: string;
    announceChatReportID: string;
    adminsChatReportID: string;
    expenseChatReportID: string;
    ownerEmail: string;
    makeMeAdmin: boolean;
    policyName: string;
    type: string;
    announceCreatedReportActionID: string;
    adminsCreatedReportActionID: string;
    expenseCreatedReportActionID: string;
    customUnitID: string;
    customUnitRateID: string;
};

export default CreateWorkspaceParams;
