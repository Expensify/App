import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

/**
 * Hook to check if the current user is anonymous
 * Returns true if the user's auth token type is ANONYMOUS, false otherwise
 */
function useIsAnonymousUser() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    return session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
}

export default useIsAnonymousUser;
