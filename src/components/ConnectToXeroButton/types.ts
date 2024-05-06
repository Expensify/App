import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToXeroButtonProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToXeroButtonProps};
