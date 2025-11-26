import type {NavigationRoute} from '@libs/Navigation/types';
import getVisibleWideRHPKeys from './getVisibleRHPRouteKeys';

function getIsWideRHPOpenedBelow(focusedRoute: NavigationRoute | undefined, allWideRHPKeys: string[]) {
    // Shouldn't ever happen but for type safety
    if (!focusedRoute?.key) {
        return false;
    }

    const currentWideRHPRouteKeys = getVisibleWideRHPKeys(allWideRHPKeys);
    return currentWideRHPRouteKeys.length > 0 && !currentWideRHPRouteKeys.includes(focusedRoute.key);
}

export default getIsWideRHPOpenedBelow;
