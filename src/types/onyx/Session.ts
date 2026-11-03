import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** Possible states of the automatic authentication after user clicks on a security link */
type AutoAuthState = ValueOf<typeof CONST.AUTO_AUTH_STATE>;

/** Model of user session data */
type Session = {
    /** The user's email for the current session */
    email?: string;

    /** Currently logged in user authToken */
    [CONST.HTTP_HEADER_NAMES.AUTH_TOKEN]?: string;

    /** Currently logged in user authToken type */
    authTokenType?: ValueOf<typeof CONST.AUTH_TOKEN_TYPES>;

    /** Currently logged in user support authToken */
    supportAuthToken?: string;

    /** Currently logged in user encrypted authToken */
    encryptedAuthToken?: string;

    loading?: boolean;

    /** Currently logged in user accountID */
    accountID?: number;

    /** Current state of the automatic authentication after user clicks on a security link */
    autoAuthState?: AutoAuthState;

    /** Server side errors keyed by microtime */
    errors?: Errors;

    signedInWithShortLivedAuthToken?: boolean;
    signedInWithSAML?: boolean;
    isSupportAuthTokenUsed?: boolean;

    /** Timestamp of the session creation date */
    creationDate?: number;

    /** How the user authenticated for the current session, forwarded to the fraud protection backend */
    authMethod?: string;
};

export default Session;

export type {AutoAuthState};
