import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import type {NavigationRoute} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import useRootNavigationState from './useRootNavigationState';

/**
 * Returns true when the Home tab is the active tab in the top-most TAB_NAVIGATOR.
 * Stays true when an RHP is pushed on top of the Home screen (e.g. opening an expense in the wide
 * right-hand pane), unlike `useIsFocused()` which becomes false because the RHP is the leaf focused route.
 */
function useIsHomeTabFocused(): boolean {
    return useRootNavigationState((state) => {
        if (!state) {
            return false;
        }
        const topTabNavigator = state.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR) as NavigationRoute | undefined;
        return getActiveTabName(topTabNavigator) === SCREENS.HOME;
    });
}

export default useIsHomeTabFocused;
