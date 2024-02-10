import type {NavigationState, PartialState} from '@react-navigation/native';
import {getStateFromPath} from '@react-navigation/native';
import {isAnonymousUser} from '@libs/actions/Session';
import getShouldUseNarrowLayout from '@libs/getShouldUseNarrowLayout';
import getTopmostNestedRHPRoute from '@libs/Navigation/getTopmostNestedRHPRoute';
import type {BottomTabName, CentralPaneName, FullScreenName, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import CENTRAL_PANE_TO_RHP_MAPPING from './CENTRAL_PANE_TO_RHP_MAPPING';
import config from './config';
import FULL_SCREEN_TO_RHP_MAPPING from './FULL_SCREEN_TO_RHP_MAPPING';
import getMatchingBottomTabRouteForState from './getMatchingBottomTabRouteForState';
import getMatchingCentralPaneRouteForState from './getMatchingCentralPaneRouteForState';
import replacePathInNestedState from './replacePathInNestedState';

type Metainfo = {
    // Sometimes modal screens don't have information about what should be visible under the overlay.
    // That means such screen can have different screens under the overlay depending on what was already in the state.
    // If the screens in the bottom tab and central pane are not mandatory for this state, we want to have this information.
    // It will help us later with creating proper diff betwen current and desired state.
    isCentralPaneAndBottomTabMandatory: boolean;
    isFullScreenNavigatorMandatory: boolean;
};

type GetAdaptedStateReturnType = {
    adaptedState: ReturnType<typeof getStateFromPath>;
    metainfo: Metainfo;
};

type GetAdaptedStateFromPath = (...args: Parameters<typeof getStateFromPath>) => GetAdaptedStateReturnType;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

const addPolicyIDToRoute = (route: NavigationPartialRoute, policyID?: string) => {
    const routeWithPolicyID = {...route};
    if (!routeWithPolicyID.params) {
        routeWithPolicyID.params = {policyID};
        return routeWithPolicyID;
    }

    if ('policyID' in routeWithPolicyID.params && !!routeWithPolicyID.params.policyID) {
        return routeWithPolicyID;
    }

    routeWithPolicyID.params = {...routeWithPolicyID.params, policyID};

    return routeWithPolicyID;
};

function createBottomTabNavigator(route: NavigationPartialRoute<BottomTabName>, policyID?: string): NavigationPartialRoute<typeof NAVIGATORS.BOTTOM_TAB_NAVIGATOR> {
    const routesForBottomTabNavigator: Array<NavigationPartialRoute<BottomTabName>> = [{name: SCREENS.HOME, params: {policyID}}];

    if (route.name !== SCREENS.HOME) {
        // If the generated state requires tab other than HOME, we need to insert it.
        routesForBottomTabNavigator.push(addPolicyIDToRoute(route, policyID) as NavigationPartialRoute<BottomTabName>);
    }

    return {
        name: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
        state: getRoutesWithIndex(routesForBottomTabNavigator),
    };
}

function createCentralPaneNavigator(route: NavigationPartialRoute<CentralPaneName>): NavigationPartialRoute<typeof NAVIGATORS.CENTRAL_PANE_NAVIGATOR> {
    return {
        name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
        state: getRoutesWithIndex([route]),
    };
}

function createFullScreenNavigator(route: NavigationPartialRoute<FullScreenName>): NavigationPartialRoute<typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR> {
    const routes = [];

    routes.push({name: SCREENS.SETTINGS.ROOT});
    routes.push({
        name: SCREENS.SETTINGS_CENTRAL_PANE,
        state: getRoutesWithIndex([route]),
    });

    return {
        name: NAVIGATORS.FULL_SCREEN_NAVIGATOR,
        state: getRoutesWithIndex(routes),
    };
}

// This function will return CentralPaneNavigator route or FullScreenNavigator route.
function getMatchingRootRouteForRHPRoute(
    route: NavigationPartialRoute,
): NavigationPartialRoute<typeof NAVIGATORS.CENTRAL_PANE_NAVIGATOR | typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR> | undefined {
    // Check for backTo param. One screen with different backTo value may need diferent screens visible under the overlay.
    if (route.params && 'backTo' in route.params && typeof route.params.backTo === 'string') {
        const stateForBackTo = getStateFromPath(route.params.backTo, config);
        if (stateForBackTo) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const rhpNavigator = stateForBackTo.routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

            const centralPaneOrFullScreenNavigator = stateForBackTo.routes.find(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                (route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR || route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR,
            );

            // If there is rhpNavigator in the state generated for backTo url, we want to get root route matching to this rhp screen.
            if (rhpNavigator && rhpNavigator.state) {
                const topmostNestedRHPRoute = getTopmostNestedRHPRoute(stateForBackTo);
                if (topmostNestedRHPRoute) {
                    return getMatchingRootRouteForRHPRoute(topmostNestedRHPRoute);
                }
            }

            // If we know that backTo targets the root route (central pane or full screen) we want to use it.
            if (centralPaneOrFullScreenNavigator && centralPaneOrFullScreenNavigator.state) {
                return centralPaneOrFullScreenNavigator as NavigationPartialRoute<typeof NAVIGATORS.CENTRAL_PANE_NAVIGATOR | typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR>;
            }
        }
    }

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
}

function getAdaptedState(state: PartialState<NavigationState<RootStackParamList>>, policyID?: string): GetAdaptedStateReturnType {
    const shouldUseNarrowLayout = getShouldUseNarrowLayout();
    const metainfo = {
        isCentralPaneAndBottomTabMandatory: true,
        isFullScreenNavigatorMandatory: true,
    };

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
            let matchingRootRoute = getMatchingRootRouteForRHPRoute(topmostNestedRHPRoute);

            // This may happen if this RHP doens't have a route that should be under the overlay defined.
            if (!matchingRootRoute) {
                metainfo.isCentralPaneAndBottomTabMandatory = false;
                metainfo.isFullScreenNavigatorMandatory = false;
                matchingRootRoute = createCentralPaneNavigator({name: SCREENS.REPORT});
            }

            // If the root route is type of FullScreenNavigator, the default bottom tab will be added.
            const matchingBottomTabRoute = getMatchingBottomTabRouteForState({routes: [matchingRootRoute]});
            routes.push(createBottomTabNavigator(matchingBottomTabRoute, policyID));
            routes.push(matchingRootRoute);
        }

        routes.push(rhpNavigator);
        return {
            adaptedState: getRoutesWithIndex(routes),
            metainfo,
        };
    }
    if (lhpNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found lhp

        // Currently there is only the search and workspace switcher in LHP both can have any central pane under the overlay.
        metainfo.isCentralPaneAndBottomTabMandatory = false;
        metainfo.isFullScreenNavigatorMandatory = false;
        const routes = [];
        routes.push(
            createBottomTabNavigator(
                {
                    name: SCREENS.HOME,
                },
                policyID,
            ),
        );
        if (!shouldUseNarrowLayout) {
            routes.push(
                createCentralPaneNavigator({
                    name: SCREENS.REPORT,
                }),
            );
        }
        routes.push(lhpNavigator);

        return {
            adaptedState: getRoutesWithIndex(routes),
            metainfo,
        };
    }
    if (fullScreenNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found fullscreen

        // Full screen navigator can have any central pane and bottom tab under. They will be covered anyway.
        metainfo.isCentralPaneAndBottomTabMandatory = false;

        const routes = [];
        routes.push(
            createBottomTabNavigator(
                {
                    name: SCREENS.HOME,
                },
                policyID,
            ),
        );
        if (!shouldUseNarrowLayout) {
            routes.push(createCentralPaneNavigator({name: SCREENS.REPORT}));
        }
        routes.push(fullScreenNavigator);

        return {
            adaptedState: getRoutesWithIndex(routes),
            metainfo,
        };
    }
    if (centralPaneNavigator) {
        // Routes
        // - matching bottom tab
        // - found central pane
        const routes = [];
        const matchingBottomTabRoute = getMatchingBottomTabRouteForState(state);
        routes.push(createBottomTabNavigator(matchingBottomTabRoute, policyID));
        routes.push(centralPaneNavigator);

        return {
            adaptedState: getRoutesWithIndex(routes),
            metainfo,
        };
    }
    if (bottomTabNavigator) {
        // Routes
        // - found bottom tab
        // - matching central pane on desktop layout
        if (shouldUseNarrowLayout) {
            return {
                adaptedState: state,
                metainfo,
            };
        }

        const routes = [...state.routes];
        const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(state);
        if (matchingCentralPaneRoute) {
            routes.push(createCentralPaneNavigator(matchingCentralPaneRoute));
        }

        return {
            adaptedState: getRoutesWithIndex(routes),
            metainfo,
        };
    }

    return {
        adaptedState: state,
        metainfo,
    };
}

const getAdaptedStateFromPath: GetAdaptedStateFromPath = (path, options) => {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const pathWithoutPolicyID = getPathWithoutPolicyID(normalizedPath);
    const isAnonymous = isAnonymousUser();

    // Anonymous users don't have access to workspaces
    const policyID = isAnonymous ? undefined : extractPolicyIDFromPath(path);

    const state = getStateFromPath(pathWithoutPolicyID, options) as PartialState<NavigationState<RootStackParamList>>;
    replacePathInNestedState(state, path);

    if (state === undefined) {
        throw new Error('Unable to parse path');
    }
    return getAdaptedState(state, policyID);
};

export default getAdaptedStateFromPath;
export type {Metainfo};
