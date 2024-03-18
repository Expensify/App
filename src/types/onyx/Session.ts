import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type AutoAuthState = ValueOf<typeof CONST.AUTO_AUTH_STATE>;

type Session = {
    /** The user's email for the current session */
    email?: string;

    /** Currently logged in user authToken */
    authToken?: string;

    /** Currently logged in user authToken type */
    authTokenType?: ValueOf<typeof CONST.AUTH_TOKEN_TYPES>;

    /** Currently logged in user support authToken */
    supportAuthToken?: string;

    /** Currently logged in user encrypted authToken */
    encryptedAuthToken?: string;

    /** Boolean that indicates whether it is loading or not */
    loading?: boolean;

    /** Currently logged in user accountID */
    accountID?: number;

    autoAuthState?: AutoAuthState;

    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors;

    /** User signed in with short lived token */
    signedInWithShortLivedAuthToken?: boolean;
};

export default Session;

export type {AutoAuthState};
