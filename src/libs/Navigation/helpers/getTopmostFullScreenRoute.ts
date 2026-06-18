import {navigationRef} from '@libs/Navigation/Navigation';
import type {NavigationRoute, RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Returns the active tab route of the topmost TAB_NAVIGATOR in the root navigation state.
 * Use this to determine which full-screen tab (Search, Inbox, etc.) is currently focused.
 */
function getTopmostFullScreenRoute(): NavigationRoute | undefined {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;

    if (!rootState) {
        return undefined;
    }

    const topmostTabNavigatorRoute = rootState.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    if (!topmostTabNavigatorRoute?.state) {
        return undefined;
    }
    const index = topmostTabNavigatorRoute.state.index ?? 0;
    return topmostTabNavigatorRoute.state.routes?.at(index);
}

export default getTopmostFullScreenRoute;
