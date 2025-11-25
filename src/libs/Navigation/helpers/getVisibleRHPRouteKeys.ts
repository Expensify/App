import {navigationRef} from '@libs/Navigation/Navigation';
import extractNavigationKeys from './extractNavigationKeys';
import getLastVisibleRHPRouteKey from './getLastVisibleRHPRouteKey';

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
