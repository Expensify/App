import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

import {isAnonymousSessionSelector} from '@selectors/Session';

/**
 * Returns a function giving the route a tab links to, or nothing for anonymous users. Their press handler asks them
 * to sign in, which a link opened in a new browser tab would skip.
 */
function useSignedInLinkRoute(): (route: Route) => Route | undefined {
    const [isAnonymousUser = false] = useOnyx(ONYXKEYS.SESSION, {selector: isAnonymousSessionSelector});

    return (route: Route) => (isAnonymousUser ? undefined : route);
}

export default useSignedInLinkRoute;
