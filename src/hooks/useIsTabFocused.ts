import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
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
        const topTabNavigator = state.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR) as NavigationRoute | undefined;
        return getActiveTabName(topTabNavigator) === tabName;
    });
}

export default useIsTabFocused;
