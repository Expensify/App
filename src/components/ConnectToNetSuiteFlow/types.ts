import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToNetSuiteFlowProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
    shouldStartIntegrationFlow?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToNetSuiteFlowProps};
