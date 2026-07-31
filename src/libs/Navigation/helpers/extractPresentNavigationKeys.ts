import type {NavigationRoute} from '@libs/Navigation/types';

import type {NavigationState} from '@react-navigation/native';

import extractNavigationKeys from './extractNavigationKeys';

/**
 * The NavigationState type predates preloaded routes, so their presence can only be proven at runtime.
 */
function isRouteArray(value: unknown): value is NavigationRoute[] {
    return Array.isArray(value);
}

/**
 * Extracts every route key present in a navigation state, including routes that are only preloaded. A preloaded
 * route has not been closed, so code that treats "not in the state" as "closed" must count it as present.
 */
function extractPresentNavigationKeys(state: NavigationState): Set<string> {
    const keys = extractNavigationKeys(state.routes);
    if (!('preloadedRoutes' in state) || !isRouteArray(state.preloadedRoutes)) {
        return keys;
    }
    for (const key of extractNavigationKeys(state.preloadedRoutes)) {
        keys.add(key);
    }
    return keys;
}

export default extractPresentNavigationKeys;
