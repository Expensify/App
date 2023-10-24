import {ValueOf} from 'type-fest';
import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type AutoAuthState = ValueOf<typeof CONST.AUTO_AUTH_STATE>;

type Session = {
    /** The user's email for the current session */
    email?: string;

    /** Currently logged in user authToken */
    authToken?: string;

    /** Currently logged in user authToken type */
    authTokenType?: string;

    /** Currently logged in user support authToken */
    supportAuthToken?: string;

    /** Currently logged in user encrypted authToken */
    encryptedAuthToken?: string;

    /** Currently logged in user accountID */
    accountID?: number;

    autoAuthState?: AutoAuthState;

    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors;
};

export default Session;

export type {AutoAuthState};
