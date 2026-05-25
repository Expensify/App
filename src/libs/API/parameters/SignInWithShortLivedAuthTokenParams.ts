import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

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
};

export default SignInWithShortLivedAuthTokenParams;
