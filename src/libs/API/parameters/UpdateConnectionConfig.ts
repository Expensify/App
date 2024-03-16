import type {ConnectionConfig, ConnectionName} from '@src/types/onyx/Policy';

type UpdateConnectionConfigParams = {
    policyId: string;
    connectionName: ConnectionName;
    config: Partial<ConnectionConfig>;
    idempotencyKey: string;
};

export default UpdateConnectionConfigParams;
