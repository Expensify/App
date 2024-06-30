type UpdatePolicyConnectionConfigParams = {
    policyID: string;
    connectionName: string;
    settingName: string;
    settingValue: string;
    idempotencyKey: string;
};

export default UpdatePolicyConnectionConfigParams;
