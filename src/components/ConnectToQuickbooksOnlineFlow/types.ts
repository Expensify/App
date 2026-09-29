import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToQuickbooksOnlineFlowProps = {
    policyID: string;
    isIntuitEnterpriseSuite?: boolean;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToQuickbooksOnlineFlowProps};
