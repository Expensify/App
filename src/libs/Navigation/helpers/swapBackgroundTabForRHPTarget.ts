import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/native';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationPartialRoute, StackNavigationAction} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import {getMatchingFullScreenRoute} from './getAdaptedStateFromPath';
import getStateFromPath from './getStateFromPath';
import {shouldChangeToMatchingFullScreen} from './linkTo';
import {getTabState} from './tabNavigatorUtils';

type CrossTabContext = {
    matchingFullScreenRoute: NavigationPartialRoute;
    tabState: ReturnType<typeof getTabState>;
    tabNavigatorStateKey: string | undefined;
};

/**
 * When a RHP is already open and we are about to navigate to another RHP route, work out the
 * background full-screen route the target should sit over. Returns the context needed to
 * dispatch a tab swap, or undefined if no swap is needed (same tab) or the data is unavailable.
 */
function getCrossTabContext(currentState: NavigationState | undefined, route: Route): CrossTabContext | undefined {
    if (!currentState) {
        return undefined;
    }
    try {
        const targetState = getStateFromPath(route);
        const targetFocusedRoute = targetState ? findFocusedRoute(targetState) : undefined;
        if (!targetFocusedRoute) {
            return undefined;
        }

        const matchingTabNavigatorRoute = getMatchingFullScreenRoute(targetFocusedRoute);
        const matchingTabState = matchingTabNavigatorRoute ? getTabState(matchingTabNavigatorRoute as NavigationPartialRoute) : undefined;
        const matchingFullScreenRoute = matchingTabState?.routes?.at(matchingTabState.index ?? 0) as NavigationPartialRoute | undefined;

        const tabRoute = currentState.routes.findLast((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const tabState = tabRoute ? getTabState(tabRoute as NavigationPartialRoute) : undefined;
        const tabNavigatorStateKey = tabRoute?.state?.key;
        const currentFullScreenRoute = tabState?.routes?.at(tabState.index ?? 0) as NavigationPartialRoute | undefined;

        if (!matchingFullScreenRoute || !currentFullScreenRoute) {
            return undefined;
        }

        if (!shouldChangeToMatchingFullScreen(targetFocusedRoute, matchingFullScreenRoute, currentFullScreenRoute)) {
            return undefined;
        }

        return {matchingFullScreenRoute, tabState, tabNavigatorStateKey};
    } catch (error) {
        Log.warn('swapBackgroundTabForRHPTarget: failed to compute cross-tab context', {message: (error as Error)?.message});
        return undefined;
    }
}

/**
 * Dispatch a navigation action that swaps the background tab beneath an open RHP without
 * closing the RHP itself. Used so a user can click a "fix the card" style link from an open
 * RHP and have the central pane animate to the new tab while the RHP content updates in place —
 * avoiding the close+reopen flicker described in https://github.com/Expensify/App/issues/89710.
 *
 * Mirrors the dispatch shape `linkTo` uses internally for cross-tab full-screen matching,
 * but `target`-scopes the dispatch to the TAB_NAVIGATOR so the root stack (with the RHP on top)
 * is left alone. Returns true when a dispatch happened.
 */
function swapBackgroundTabForRHPTarget(currentState: NavigationState | undefined, route: Route): boolean {
    const context = getCrossTabContext(currentState, route);
    if (!context) {
        return false;
    }
    const {matchingFullScreenRoute, tabState, tabNavigatorStateKey} = context;

    const matchingFullScreenRouteInTabRootState = tabState?.routes?.find((r) => r.name === matchingFullScreenRoute.name);
    if (matchingFullScreenRouteInTabRootState && matchingFullScreenRouteInTabRootState.state === undefined) {
        // First-time visit: initialize the matching tab so its sidebar/split route is added.
        const additionalAction: StackNavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
            payload: {
                name: matchingFullScreenRoute.name,
                params: {
                    ...(matchingFullScreenRoute.params ?? {}),
                    ...(matchingFullScreenRoute.state ? {state: matchingFullScreenRoute.state} : {}),
                },
            },
            target: tabNavigatorStateKey,
        };
        navigationRef.dispatch(additionalAction);
    } else {
        // Plain tab switch within the existing TAB_NAVIGATOR.
        const lastRouteInMatchingFullScreen = matchingFullScreenRoute.state?.routes?.at(-1);
        const additionalAction: StackNavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
            payload: {
                name: matchingFullScreenRoute.name,
                params: lastRouteInMatchingFullScreen ? {screen: lastRouteInMatchingFullScreen.name, params: lastRouteInMatchingFullScreen.params} : matchingFullScreenRoute.params,
            },
            target: tabNavigatorStateKey,
        };
        navigationRef.dispatch(additionalAction);
    }
    return true;
}

export default swapBackgroundTabForRHPTarget;
