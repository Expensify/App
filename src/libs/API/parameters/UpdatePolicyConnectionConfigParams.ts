import type {ConnectionName, Connections} from '@src/types/onyx/Policy';

type UpdatePolicyConnectionConfigParams<TConnectionName extends ConnectionName, TSettingName extends keyof Connections[TConnectionName]['config']> = {
    policyID: string;
    connectionName: TConnectionName;
    settingName: TSettingName;
    settingValue: Connections[TConnectionName]['config'][TSettingName];
    idempotencyKey: string;
};

export default UpdatePolicyConnectionConfigParams;
