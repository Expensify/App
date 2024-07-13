import type { ConnectionName } from "@src/types/onyx/Policy";

type ReuseExistingConnectionForPolicy = {
    policyID: string;
    targetPolicyID: string;
    connectionName: ConnectionName;
};

export default ReuseExistingConnectionForPolicy;
