import {isSharedProductHost} from '@libs/ExperienceCookie';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenSelector} from '@src/selectors/Session';

import {useIsFocused} from '@react-navigation/native';

import useOnyx from './useOnyx';

/**
 * Whether a signed-out user should sign in on the Expensify Classic page instead of the sign-in screen that renders this hook.
 * That's the case on the host that serves both products, unless a sign-in is already in progress in New Expensify.
 */
function useShouldSignInThroughClassic(): boolean {
    const [authToken] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenSelector});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [isAuthenticatingWithShortLivedToken] = useOnyx(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN);

    // Other public screens, like the one that signs in with a short-lived token, cover the sign-in screen while they work
    const isFocused = useIsFocused();

    if (!isSharedProductHost() || !isFocused) {
        return false;
    }

    // The Expensify Classic sign-in page lives at this path, so reaching this screen there means opening it again would only reload the page
    if (window.location.pathname === `/${CONST.OLDDOT_URLS.SIGN_IN}`) {
        return false;
    }

    // Stored credentials mean a sign-in started in New Expensify, for example a two-factor or SAML step, and it has to finish there
    const hasStartedSignIn = !!credentials?.login || !!credentials?.validateCode;
    return !authToken && !hasStartedSignIn && !isAuthenticatingWithShortLivedToken;
}

export default useShouldSignInThroughClassic;
