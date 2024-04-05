import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';

type ConnectToQuickbooksOnlineButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ConnectToQuickbooksOnlineButtonProps = ConnectToQuickbooksOnlineButtonOnyxProps & {
    policyID: string;
    environmentURL: string;
};

export type {ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonProps};
