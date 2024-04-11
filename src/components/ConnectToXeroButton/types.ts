import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';

type ConnectToXeroButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ConnectToXeroButtonProps = ConnectToXeroButtonOnyxProps & {
    policyID: string;
    environmentURL: string;
};

export type {ConnectToXeroButtonOnyxProps, ConnectToXeroButtonProps};
