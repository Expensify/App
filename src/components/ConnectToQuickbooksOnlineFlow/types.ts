import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToQuickbooksOnlineFlowProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
    shouldStartIntegrationFlow?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToQuickbooksOnlineFlowProps};
