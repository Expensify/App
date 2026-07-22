import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import type {NavigationRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import useRootNavigationState from './useRootNavigationState';

/**
 * Returns true when the Workspaces tab is the active tab in the top-most TAB_NAVIGATOR.
 * Stays true when an RHP is pushed on top of a workspace screen, unlike `useIsFocused()`
 * which becomes false because the RHP is the leaf focused route.
 */
function useIsWorkspacesTabFocused(): boolean {
    return useRootNavigationState((state) => {
        if (!state) {
            return false;
        }
        const topTabNavigator = state.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR) as NavigationRoute | undefined;
        return getActiveTabName(topTabNavigator) === NAVIGATORS.WORKSPACE_NAVIGATOR;
    });
}

export default useIsWorkspacesTabFocused;
