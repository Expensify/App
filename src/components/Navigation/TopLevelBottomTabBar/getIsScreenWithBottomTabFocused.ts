import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/native';
import {isSplitNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import SCREENS_WITH_BOTTOM_TAB_BAR from './SCREENS_WITH_BOTTOM_TAB_BAR';

function getIsScreenWithBottomTabFocused(state: NavigationState) {
    const focusedRoute = findFocusedRoute(state);

    // We are checking if the focused route is a split navigator because there may be a brief moment where the navigator doesn't have state yet.
    // That mens we don't have screen with bottom tab focused. This caused glitching.
    return SCREENS_WITH_BOTTOM_TAB_BAR.includes(focusedRoute?.name ?? '') || isSplitNavigatorName(focusedRoute?.name);
}

export default getIsScreenWithBottomTabFocused;
