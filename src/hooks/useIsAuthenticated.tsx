import {useMemo} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useIsAuthenticated() {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isAuthenticated = useMemo(() => !!(session?.authToken ?? null), [session?.authToken]);
    return isAuthenticated;
}

export default useIsAuthenticated;
