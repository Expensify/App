/**
 * Helpers for reading the third party accounts a user connected, such as Gmail for receipt sync.
 */
import CONST from '@src/CONST';
import type {OAuthConnections} from '@src/types/onyx';
import type {OAuthConnection} from '@src/types/onyx/OAuthConnections';

import type {OnyxEntry} from 'react-native-onyx';

import DateUtils from './DateUtils';

type GmailConnection = OAuthConnection & {connectionID: string};

function getGmailConnections(oauthConnections: OnyxEntry<OAuthConnections>): GmailConnection[] {
    return Object.entries(oauthConnections ?? {})
        .filter(([, connection]) => connection?.provider === CONST.OAUTH_CONNECTIONS.PROVIDER.GMAIL)
        .map(([connectionID, connection]) => ({...connection, connectionID}));
}

function hasGmailConnectionErrorSelector(oauthConnections: OnyxEntry<OAuthConnections>): boolean {
    return getGmailConnections(oauthConnections).some((connection) => !!connection.error);
}

/** Converts the Unix timestamp in seconds from the backend into the datetime format the date helpers expect */
function getLastSearchedDatetime(lastSearchedAt: number | null | undefined): string | undefined {
    if (!lastSearchedAt) {
        return undefined;
    }
    return DateUtils.getDBTime(lastSearchedAt * CONST.MILLISECONDS_PER_SECOND);
}

export {getGmailConnections, getLastSearchedDatetime, hasGmailConnectionErrorSelector};
export type {GmailConnection};
