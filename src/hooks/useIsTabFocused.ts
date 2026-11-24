import {getPreInsertedOriginalTabRoute} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import type {NavigationRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

import useRootNavigationState from './useRootNavigationState';

/**
 * Returns true when `tabName` is the active tab. Unlike `useIsFocused()`, it stays true when an RHP
 * is pushed on top of that tab's screen.
 */
function useIsTabFocused(tabName: string): boolean {
    return useRootNavigationState((state) => {
        if (!state) {
            return false;
        }
        const tabNavigatorIndex = state.routes.findLastIndex((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
        if (tabNavigatorIndex < 0) {
            return false;
        }
        const topTabNavigator = state.routes.at(tabNavigatorIndex) as NavigationRoute | undefined;
        const preInsertedOriginalTabRoute = getPreInsertedOriginalTabRoute();

        // Pre-inserting a destination under an RHP is not a tab departure. Keep the original tab focused until the
        // destination is committed or the RHP disappears, so cancelling does not look like returning to the tab.
        const isDestinationPreInsertedUnderRHP =
            !!preInsertedOriginalTabRoute &&
            preInsertedOriginalTabRoute.key === topTabNavigator?.key &&
            state.routes.slice(tabNavigatorIndex + 1).some((route) => isSideModalNavigator(route.name));

        return getActiveTabName(isDestinationPreInsertedUnderRHP ? preInsertedOriginalTabRoute : topTabNavigator) === tabName;
    });
}

export default useIsTabFocused;
