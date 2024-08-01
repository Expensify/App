type CreateWorkspaceFromIOUPaymentParams = {
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
    iouReportID: string;
    memberData: string;
    reportActionID: string;
};

export default CreateWorkspaceFromIOUPaymentParams;
