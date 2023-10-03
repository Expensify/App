import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type AutoAuthState = ValueOf<typeof CONST.AUTO_AUTH_STATE>;

type Session = {
    /** The user's email for the current session */
    email?: string;

    /** Currently logged in user authToken */
    authToken?: string;

    authTokenType?: string;

    supportAuthToken?: string;

    /** Currently logged in user encrypted authToken */
    encryptedAuthToken?: string;

    /** Currently logged in user accountID */
    accountID?: number;

    autoAuthState?: AutoAuthState;
};

export default Session;

export type {AutoAuthState};
