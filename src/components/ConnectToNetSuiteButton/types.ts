import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToNetSuiteButtonProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToNetSuiteButtonProps};
