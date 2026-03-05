import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenSelector} from '@src/selectors/Session';
import useOnyx from './useOnyx';

function useIsAuthenticated() {
    const [authToken] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenSelector});
    const isAuthenticated = !!authToken;
    return isAuthenticated;
}

export default useIsAuthenticated;
