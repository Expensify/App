import type {ConnectionName, Connections} from '@src/types/onyx/Policy';

type UpdatePolicyConnectionConfigParams<TConnectionName extends ConnectionName, TSettingName extends keyof Connections[TConnectionName]['config']> = {
    policyID: string;
    connectionName: string;
    settingName: string;
    settingValue: string | boolean;
    idempotencyKey: string ;
};

export default UpdatePolicyConnectionConfigParams;
