import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

type ConnectToQuickbooksOnlineButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ConnectToQuickbooksOnlineButtonProps = ConnectToQuickbooksOnlineButtonOnyxProps & {
    policyID: string;
    environmentURL: string;
    disconnectIntegrationBeforeConnecting?: boolean;
    integrationToConnect?: ConnectionName;
};

export type {ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonProps};
