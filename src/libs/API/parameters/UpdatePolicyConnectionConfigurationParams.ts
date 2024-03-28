import type {ConnectionName} from '@src/types/onyx/Policy';

type UpdatePolicyConnectionConfigurationParams = {
    policyID: string;
    connectionName: ConnectionName;
    settingName: string;
    settingValue: unknown;
};

export default UpdatePolicyConnectionConfigurationParams;
