import type {NavigationRoute} from '@libs/Navigation/types';

import type {NavigationState} from '@react-navigation/native';

import extractNavigationKeys from './extractNavigationKeys';

/**
 * Extracts every route key present in a navigation state, including routes that are only preloaded. A preloaded
 * route has not been closed, so code that treats "not in the state" as "closed" must count it as present. The
 * base NavigationState type predates preloaded routes, so the field is declared here the way StackRouter types it.
 */
function extractPresentNavigationKeys(state: NavigationState & {preloadedRoutes?: NavigationRoute[]}): Set<string> {
    const keys = extractNavigationKeys(state.routes);
    for (const key of extractNavigationKeys(state.preloadedRoutes)) {
        keys.add(key);
    }
    return keys;
}

export default extractPresentNavigationKeys;
