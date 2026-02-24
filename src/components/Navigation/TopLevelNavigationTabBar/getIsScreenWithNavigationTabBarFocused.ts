import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/native';
import SCREENS_WITH_NAVIGATION_TAB_BAR from './SCREENS_WITH_NAVIGATION_TAB_BAR';

function getIsScreenWithNavigationTabBarFocused(state: NavigationState) {
    const focusedRoute = findFocusedRoute(state);

    const routeName = focusedRoute?.params && 'screen' in focusedRoute.params ? (focusedRoute.params.screen as string) : focusedRoute?.name;
    // We are checking if the focused route is a split navigator because there may be a brief moment where the navigator doesn't have state yet.
    // That mens we don't have screen with bottom tab focused. This caused glitching.
    return SCREENS_WITH_NAVIGATION_TAB_BAR.includes(routeName ?? '');
}

export default getIsScreenWithNavigationTabBarFocused;
