import type {ConnectionName} from '@src/types/onyx/Policy';

type CopyExistingPolicyConnectionParams = {
    policyID: string;
    targetPolicyID: string;
    connectionName: ConnectionName;
};

export default CopyExistingPolicyConnectionParams;
