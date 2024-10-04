type SyncConnectionParams = {
    policyID: string;
    idempotencyKey: string;
    forceDataRefresh?: boolean;
};

export default SyncConnectionParams;
