import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';
import {navigationRef} from '@libs/Navigation/Navigation';

/**
 * Extracts the keys of the screens that are currently displayed from the array of all Wide/Super Wide RHP keys
 *
 * @param allWideRHPKeys - an array of all Wide/Super Wide RHP keys
 */
function getVisibleWideRHPKeys(allWideRHPKeys: string[]) {
    const rootState = navigationRef.getRootState();

    if (!rootState) {
        return [];
    }

    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(rootState);
    const lastRHPRoute = rootState.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    if (!lastRHPRoute) {
        return [];
    }

    const lastRHPKeys = extractNavigationKeys(lastRHPRoute.state);
    const currentKeys = allWideRHPKeys.filter((key) => lastRHPKeys.has(key));

    return currentKeys;
}

export default getVisibleWideRHPKeys;
