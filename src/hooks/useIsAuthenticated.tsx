import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useIsAuthenticated() {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isAuthenticated = useMemo(() => !!(session?.authToken ?? null), [session]);
    return isAuthenticated;
}

export default useIsAuthenticated;
