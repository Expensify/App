import {useMemo} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook to check if the current user is anonymous
 * Returns true if the user's auth token type is ANONYMOUS, false otherwise
 */
function useIsAnonymousUser() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const isAnonymousUser = useMemo(() => {
        return session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
    }, [session?.authTokenType]);

    return isAnonymousUser ?? false;
}

export default useIsAnonymousUser;
