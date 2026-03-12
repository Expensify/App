import type {NavigationState} from '@react-navigation/native';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';

function getIsScreenBlurred(state: NavigationState, currentRouteKey: string) {
    const lastFullScreenRoute = state.routes.findLast((route) => isFullScreenName(route.name));

    if (!lastFullScreenRoute) {
        return false;
    }

    // Direct key match — screen is focused.
    if (lastFullScreenRoute.key === currentRouteKey) {
        return false;
    }

    // Key mismatch fallback: check if the current route and the focused route are the same navigator type.
    // This handles the key-reuse optimization in useCustomRootStackNavigatorState where the rendered
    // route keeps an old canonical key while the real navigation state has a newer key for the same
    // navigator type. Without this check, FreezeWrapper would incorrectly freeze the active screen.
    const currentRouteInState = state.routes.find((r) => r.key === currentRouteKey);
    if (currentRouteInState?.name === lastFullScreenRoute.name) {
        return false;
    }

    return true;
}

export default getIsScreenBlurred;
