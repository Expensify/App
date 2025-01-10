import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToNetSuiteQuickStartFlowProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToNetSuiteQuickStartFlowProps};
