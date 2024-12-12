type CreateWorkspaceFromIOUPaymentParams = {
    policyID: string;
    adminsChatReportID: string;
    expenseChatReportID: string;
    ownerEmail: string;
    makeMeAdmin: boolean;
    policyName: string;
    type: string;
    adminsCreatedReportActionID: string;
    expenseCreatedReportActionID: string;
    customUnitID: string;
    customUnitRateID: string;
    iouReportID: string;
    memberData: string;
    reportActionID: string;
};

export default CreateWorkspaceFromIOUPaymentParams;
