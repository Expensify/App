import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import useOnyx from './useOnyx';

const authTokenTypeSelector = (session: OnyxEntry<Session>) => session?.authTokenType;

/**
 * Hook to check if the current user is anonymous
 * Returns true if the user's auth token type is ANONYMOUS, false otherwise
 */
function useIsAnonymousUser() {
    const [authTokenType = CONST.AUTH_TOKEN_TYPES.ANONYMOUS] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    return authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
}

export default useIsAnonymousUser;
