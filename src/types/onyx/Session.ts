import * as OnyxCommon from './OnyxCommon';

type Session = {
    /** The user's email for the current session */
    email?: string;

    /** Currently logged in user authToken */
    authToken?: string;

    supportAuthToken?: string;

    /** Currently logged in user encrypted authToken */
    encryptedAuthToken?: string;

    /** Currently logged in user accountID */
    accountID?: number;

    autoAuthState?: string;
    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors;
};

export default Session;
