import type {NavigationState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import {isFullScreenName} from './isNavigatorName';

function getLastVisibleRHPRouteKey(state: NavigationState | undefined) {
    // Safe handling when navigation is not yet initialized
    if (!state) {
        return undefined;
    }
    const lastFullScreenRouteIndex = state?.routes.findLastIndex((route) => isFullScreenName(route.name));
    const lastRHPRouteIndex = state?.routes.findLastIndex((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    // Both routes have to be present and the RHP have to be after last full screen for it to be visible.
    if (lastFullScreenRouteIndex === -1 || lastRHPRouteIndex === -1 || lastFullScreenRouteIndex > lastRHPRouteIndex) {
        return undefined;
    }

    return state?.routes.at(lastRHPRouteIndex)?.key;
}

export default getLastVisibleRHPRouteKey;
