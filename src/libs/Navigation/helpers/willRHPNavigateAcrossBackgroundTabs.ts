import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/native';
import type {NavigationPartialRoute} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import {getMatchingFullScreenRoute} from './getAdaptedStateFromPath';
import getStateFromPath from './getStateFromPath';
import {shouldChangeToMatchingFullScreen} from './linkTo';
import {getTabState} from './tabNavigatorUtils';

/**
 * When a RHP is already open and we are about to navigate to another RHP route, determine
 * whether the target RHP belongs to a different background (full-screen) tab than the one
 * currently displayed behind the open RHP.
 *
 * When this returns true, callers should close the current RHP flow before navigating so that
 * the navigation pipeline can set up the correct background tab. Without doing so the new RHP
 * is opened over the previous background, leaving the user with the wrong page underneath
 */
function willRHPNavigateAcrossBackgroundTabs(currentState: NavigationState | undefined, route: Route): boolean {
    if (!currentState) {
        return false;
    }
    try {
        const targetState = getStateFromPath(route);
        const targetFocusedRoute = targetState ? findFocusedRoute(targetState) : undefined;
        if (!targetFocusedRoute) {
            return false;
        }

        const matchingTabNavigatorRoute = getMatchingFullScreenRoute(targetFocusedRoute);
        const matchingTabState = matchingTabNavigatorRoute ? getTabState(matchingTabNavigatorRoute as NavigationPartialRoute) : undefined;
        const matchingFullScreenRoute = matchingTabState?.routes?.at(matchingTabState.index ?? 0) as NavigationPartialRoute | undefined;

        const tabRoute = currentState.routes.findLast((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const tabState = tabRoute ? getTabState(tabRoute as NavigationPartialRoute) : undefined;
        const currentFullScreenRoute = tabState?.routes?.at(tabState.index ?? 0) as NavigationPartialRoute | undefined;

        if (!matchingFullScreenRoute || !currentFullScreenRoute) {
            return false;
        }

        return shouldChangeToMatchingFullScreen(targetFocusedRoute, matchingFullScreenRoute, currentFullScreenRoute);
    } catch {
        return false;
    }
}

export default willRHPNavigateAcrossBackgroundTabs;
