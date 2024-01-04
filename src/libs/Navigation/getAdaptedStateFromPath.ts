/* eslint-disable @typescript-eslint/naming-convention */
import type {NavigationState, PartialState} from '@react-navigation/native';
import {getStateFromPath} from '@react-navigation/native';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import CENTRAL_PANE_TO_RHP_MAPPING from './CENTRAL_PANE_TO_RHP_MAPPING';
import FULL_SCREEN_TO_RHP_MAPPING from './FULL_SCREEN_TO_RHP_MAPPING';
import getMatchingBottomTabRouteForState from './getMatchingBottomTabRouteForState';
import getMatchingCentralPaneRouteForState from './getMatchingCentralPaneRouteForState';
import getTopmostNestedRHPRoute from './getTopmostNestedRHPRoute';
import type {BottomTabName, CentralPaneName, FullScreenName, NavigationPartialRoute, RootStackParamList} from './types';

function createBottomTabNavigator(route: NavigationPartialRoute<BottomTabName>): NavigationPartialRoute<typeof NAVIGATORS.BOTTOM_TAB_NAVIGATOR> {
    const routesForBottomTabNavigator: Array<NavigationPartialRoute<BottomTabName>> = [{name: SCREENS.HOME}];

    if (route.name !== SCREENS.HOME) {
        // If the generated state requires tab other than HOME, we need to insert it.
        routesForBottomTabNavigator.push(route);
    }

    return {
        name: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
        state: {routes: routesForBottomTabNavigator},
    };
}

function createCentralPaneNavigator(route: NavigationPartialRoute<CentralPaneName>): NavigationPartialRoute<typeof NAVIGATORS.CENTRAL_PANE_NAVIGATOR> {
    return {
        name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
        state: {routes: [route]},
    };
}

function createFullScreenNavigator(route: NavigationPartialRoute<FullScreenName>): NavigationPartialRoute<typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR> {
    const routes = [];

    routes.push({name: SCREENS.SETTINGS.ROOT});
    routes.push({
        name: SCREENS.SETTINGS_CENTRAL_PANE,
        state: {
            routes: [route],
        },
    });

    return {
        name: NAVIGATORS.FULL_SCREEN_NAVIGATOR,
        state: {
            routes,
        },
    };
}

// This function will return CentralPaneNavigator route or FullScreenNavigator route.
function getMatchingRootRouteForRHPRoute(route: NavigationPartialRoute): NavigationPartialRoute<typeof NAVIGATORS.CENTRAL_PANE_NAVIGATOR | typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR> {
    // Check for CentralPaneNavigator
    for (const [centralPaneName, RHPNames] of Object.entries(CENTRAL_PANE_TO_RHP_MAPPING)) {
        if (RHPNames.includes(route.name)) {
            return createCentralPaneNavigator({name: centralPaneName as CentralPaneName, params: route.params});
        }
    }

    // Check for FullScreenNavigator
    for (const [fullScreenName, RHPNames] of Object.entries(FULL_SCREEN_TO_RHP_MAPPING)) {
        if (RHPNames && RHPNames.includes(route.name)) {
            return createFullScreenNavigator({name: fullScreenName as FullScreenName, params: route.params});
        }
    }

    // Default route
    return createCentralPaneNavigator({name: SCREENS.REPORT, params: route.params});
}

function getAdaptedState(state: PartialState<NavigationState<RootStackParamList>>) {
    const isSmallScreenWidth = getIsSmallScreenWidth();

    // We need to check what is defined to know what we need to add.
    const bottomTabNavigator = state.routes.find((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
    const centralPaneNavigator = state.routes.find((route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
    const fullScreenNavigator = state.routes.find((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR);
    const rhpNavigator = state.routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const lhpNavigator = state.routes.find((route) => route.name === NAVIGATORS.LEFT_MODAL_NAVIGATOR);

    if (rhpNavigator) {
        // Routes
        // - matching bottom tab
        // - matching root route for rhp
        // - found rhp

        // This one will be defined because rhpNavigator is defined.
        const topmostNestedRHPRoute = getTopmostNestedRHPRoute(state);
        const routes = [];

        if (topmostNestedRHPRoute) {
            const matchingRootRoute = getMatchingRootRouteForRHPRoute(topmostNestedRHPRoute);
            // If the root route is type of FullScreenNavigator, the default bottom tab will be added.
            const matchingBottomTabRoute = getMatchingBottomTabRouteForState({routes: [matchingRootRoute]});
            routes.push(createBottomTabNavigator(matchingBottomTabRoute));
            routes.push(matchingRootRoute);
        }

        routes.push(rhpNavigator);
        return {routes};
    }
    if (lhpNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found lhp
        const routes = [];
        routes.push(createBottomTabNavigator({name: SCREENS.HOME}));
        if (!isSmallScreenWidth) {
            routes.push(createCentralPaneNavigator({name: SCREENS.REPORT}));
        }
        routes.push(lhpNavigator);

        return {routes};
    }
    if (fullScreenNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found fullscreen
        const routes = [];
        routes.push(createBottomTabNavigator({name: SCREENS.HOME}));
        if (!isSmallScreenWidth) {
            routes.push(createCentralPaneNavigator({name: SCREENS.REPORT}));
        }
        routes.push(fullScreenNavigator);

        return {routes};
    }
    if (centralPaneNavigator) {
        // Routes
        // - matching bottom tab
        // - found central pane
        const routes = [];
        const matchingBottomTabRoute = getMatchingBottomTabRouteForState(state);
        routes.push(createBottomTabNavigator(matchingBottomTabRoute));
        routes.push(centralPaneNavigator);

        return {routes};
    }
    if (bottomTabNavigator) {
        // Routes
        // - found bottom tab
        // - matching central pane on desktop layout
        if (isSmallScreenWidth) {
            return state;
        }

        const routes = [...state.routes];
        const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(state);
        if (matchingCentralPaneRoute) {
            routes.push(createCentralPaneNavigator(matchingCentralPaneRoute));
        }

        return {
            routes,
        };
    }

    return state;
}

const getAdaptedStateFromPath: typeof getStateFromPath = (path, options) => {
    const state = getStateFromPath(path, options);

    if (state === undefined) {
        throw new Error('Unable to parse path');
    }

    const adaptedState = getAdaptedState(state as PartialState<NavigationState<RootStackParamList>>);

    return adaptedState;
};

export default getAdaptedStateFromPath;
