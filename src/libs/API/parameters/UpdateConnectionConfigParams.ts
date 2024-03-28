import type {ConnectionName} from '@src/types/onyx/Policy';

type UpdateConnectionConfigParams = {
    policyID: string;
    connectionName: ConnectionName;
    settingName: string;
    settingValue: unknown;
};

export default UpdateConnectionConfigParams;
