import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** One third party account the user connected. The backend strips the credentials before sending it. */
type OAuthConnection = OnyxValueWithOfflineFeedback<{
    provider: ValueOf<typeof CONST.OAUTH_CONNECTIONS.PROVIDER>;

    /** The connected account's address, such as the Gmail address */
    id: string;

    /** Unix timestamp in seconds of the last receipt search, whether or not it found anything. Null until the first search. */
    lastSearchedAt: number | null;

    /** Null while the connection works. Otherwise it says whether reconnecting can fix it. */
    error: ValueOf<typeof CONST.OAUTH_CONNECTIONS.ERROR> | null;

    /** Set when removing the connection fails */
    errors?: Errors | null;
}>;

/** The user's third party connections, keyed by connection ID */
type OAuthConnections = Record<string, OAuthConnection>;

export default OAuthConnections;
export type {OAuthConnection};
