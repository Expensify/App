type UpdateWorkspaceAccountingChartOfAccounts = {
    policyID: string;
    connectionName: string;
    settingName: string;
    settingValue: string | boolean;
    idempotencyKey: string;
};

export default UpdateWorkspaceAccountingChartOfAccounts;
