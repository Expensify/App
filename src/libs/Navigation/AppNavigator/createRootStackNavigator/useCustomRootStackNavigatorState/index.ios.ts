import {findFocusedRoute} from '@react-navigation/native';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationRoute, SplitNavigatorName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ensureTabNavigatorRoutes from './ensureTabNavigatorRoutes';

// Swiping back on iOS does not work properly when the preloaded route has gestureEnabled set to false.
// Therefore, on screens where swiping should work, preloadedRoutes will be an empty array during rendering to ensure swiping works properly.
// Once this bug is fixed, this file should be deleted and index.android.ts renamed to index.native.ts.
// https://github.com/react-navigation/react-navigation/issues/12683
function getShouldHidePreloadedRoutes(route?: NavigationRoute) {
    if (!route) {
        return false;
    }

    // Swiping back should work in any navigator except full screen navigators.
    // This only does not apply to the WorkspaceSplitNavigator and DomainSplitNavigator as they have sidebar screens where users can swipe back to navigate to the workspace list.
    if (!isFullScreenName(route.name) || route.name === NAVIGATORS.WORKSPACE_NAVIGATOR) {
        return true;
    }

    // If the fullscreen navigator has only one route and it is not a sidebar, preloadedRoutes have to be hidden for swipe to work properly.
    // For more routes in the navigator, swipe works correctly.
    const focusedRoute = route.state?.routes?.length === 1 ? findFocusedRoute(route.state) : undefined;

    if (!focusedRoute) {
        return false;
    }

    return focusedRoute.name !== SPLIT_TO_SIDEBAR[route.name as SplitNavigatorName];
}

// This is an optimization to keep mounted only last few screens in the stack.
// On native platforms, we store the last two routes to handle swiping back.
export default function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const indexToSlice = Math.max(0, lastSplitIndex - 1);
    const slicedRoutes = state.routes.slice(indexToSlice, state.routes.length);
    const routesToRender = ensureTabNavigatorRoutes(slicedRoutes, indexToSlice, state.routes);

    const stateToRender = {...state, routes: routesToRender, index: routesToRender.length - 1};
    if (getShouldHidePreloadedRoutes(stateToRender.routes.at(-1))) {
        return {...stateToRender, preloadedRoutes: []};
    }
    return stateToRender;
}
