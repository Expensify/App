type UpdatePolicyConnectionConfigParams = {
    policyID: string;
    connectionName: string;
    settingName: string;
    settingValue: string | boolean;
    idempotencyKey: string;
};

export default UpdatePolicyConnectionConfigParams;
