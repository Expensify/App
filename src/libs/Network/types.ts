import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** The session a request attempt was sent with */
type SentAuthState = {
    /** The authToken the request was sent with, or null when it was sent without one */
    authToken: string | null;

    /** The type of the session's authToken when the request was sent, such as a copilot (delegate) token */
    authTokenType: ValueOf<typeof CONST.AUTH_TOKEN_TYPES> | null;
};

export default SentAuthState;
