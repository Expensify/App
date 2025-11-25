import type {NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import getVisibleWideRHPKeys from './getVisibleRHPRouteKeys';

function getIsWideRHPOpenedBelow(state: NavigationState | undefined, allWideRHPKeys: string[]) {
    if (!state) {
        return false;
    }
    const focusedRoute = findFocusedRoute(state);

    // Shouldn't ever happen but for type safety
    if (!focusedRoute?.key) {
        return false;
    }

    const currentWideRHPRouteKeys = getVisibleWideRHPKeys(allWideRHPKeys);
    return currentWideRHPRouteKeys.length > 0 && !currentWideRHPRouteKeys.includes(focusedRoute.key);
}

export default getIsWideRHPOpenedBelow;
