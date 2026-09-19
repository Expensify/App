import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SignInWithShortLivedAuthTokenParams = {
    authToken: string;
    skipReauthentication: boolean;
    /**
     * Upstream auth method (e.g. `'saml'`) forwarded to the fraud protection backend as the session's
     * `authentication` attribute. `SignInWithShortLivedAuthToken` is hit by multiple flows — at least
     * SAML sign-in and OldDot → NewDot deep-link handovers — so callers should set this when the upstream
     * method is known.
     */
    authMethod?: ValueOf<typeof CONST.AUTH_METHOD>;
    deviceInfo: string;
    /**
     * The device's current session `authToken`, sent only when the device is already authenticated.
     * Omit when the device has no current session (the public `/transition` sign-in and SAML sign-in flows).
     */
    currentAuthToken?: string;
};

export default SignInWithShortLivedAuthTokenParams;
