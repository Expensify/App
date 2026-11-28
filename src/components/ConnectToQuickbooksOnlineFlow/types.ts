import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToQuickbooksOnlineFlowProps = {
    policyID: string;
    isIntuitEnterpriseSuite?: boolean;

    /** Connects to the sandbox when true and the live account when false. When undefined, the flow asks the user. */
    isSandbox?: boolean;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

// eslint-disable-next-line import/prefer-default-export
export type {ConnectToQuickbooksOnlineFlowProps};
