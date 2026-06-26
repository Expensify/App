import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationRoute, RootNavigatorParamList, State} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Returns the active tab route of the topmost TAB_NAVIGATOR in the root navigation state.
 * Use this to determine which full-screen tab (Search, Inbox, etc.) is currently focused.
 *
 * Fallback chain: live tab state → preserved state.
 */
function getTopmostFullScreenRoute(): NavigationRoute | undefined {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;

    if (!rootState) {
        return undefined;
    }

    const topmostTabNavigatorRoute = rootState.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    if (!topmostTabNavigatorRoute) {
        return undefined;
    }

    const liveState = topmostTabNavigatorRoute.state;
    const liveRoute = liveState ? liveState.routes?.at(liveState.index ?? 0) : undefined;
    if (liveRoute) {
        return liveRoute;
    }

    const preservedState = topmostTabNavigatorRoute.key ? getPreservedNavigatorState(topmostTabNavigatorRoute.key) : undefined;
    if (preservedState) {
        const preservedRoute = preservedState.routes?.at(preservedState.index ?? 0);
        if (preservedRoute) {
            return preservedRoute;
        }
    }

    return undefined;
}

export default getTopmostFullScreenRoute;
