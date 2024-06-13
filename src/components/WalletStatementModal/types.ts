import type {OnyxEntry} from 'react-native-onyx';
import type {Session} from '@src/types/onyx';

type WalletStatementOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type WalletStatementProps = WalletStatementOnyxProps & {
    /** URL for oldDot (expensify.com) statements page to display */
    statementPageURL: string;
};

type WalletStatementMessage = {
    url: string;
    type: string;
};

export type {WalletStatementProps, WalletStatementOnyxProps, WalletStatementMessage};
