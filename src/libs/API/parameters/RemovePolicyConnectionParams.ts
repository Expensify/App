import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type RemovePolicyConnectionParams = {
    policyID: string;
    connectionName: PolicyConnectionName;
};

export default RemovePolicyConnectionParams;
