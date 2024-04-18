import type {ConnectionName} from '@src/types/onyx/Policy';

type ConnectToQuickbooksOnlineButtonProps = {
    policyID: string;
    environmentURL: string;
    disconnectIntegrationBeforeConnecting?: boolean;
    integrationToConnect?: ConnectionName;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToQuickbooksOnlineButtonProps};
