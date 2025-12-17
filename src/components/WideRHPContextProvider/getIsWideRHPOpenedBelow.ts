import type {NavigationRoute} from '@libs/Navigation/types';
import getVisibleWideRHPKeys from './getVisibleRHPRouteKeys';

function getIsWideRHPOpenedBelow(focusedRoute: NavigationRoute | undefined, allWideRHPKeys: string[]) {
    // Shouldn't ever happen but for type safety
    if (!focusedRoute?.key) {
        return false;
    }

    const visibleWideRHPRouteKeys = getVisibleWideRHPKeys(allWideRHPKeys);
    return visibleWideRHPRouteKeys.length > 0 && !visibleWideRHPRouteKeys.includes(focusedRoute.key);
}

export default getIsWideRHPOpenedBelow;
