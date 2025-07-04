import type {NavigationState, PartialState, Route} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import pick from 'lodash/pick';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import {config} from '@libs/Navigation/linkingConfig/config';
import {RHP_TO_SEARCH, RHP_TO_SETTINGS, RHP_TO_SIDEBAR, RHP_TO_WORKSPACE} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute, RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import getParamsFromRoute from './getParamsFromRoute';
import {isFullScreenName} from './isNavigatorName';
import replacePathInNestedState from './replacePathInNestedState';

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

type GetAdaptedStateReturnType = ReturnType<typeof getStateFromPath>;

type GetAdaptedStateFromPath = (...args: [...Parameters<typeof getStateFromPath>, shouldReplacePathInNestedState?: boolean]) => GetAdaptedStateReturnType;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function isRouteWithBackToParam(route: NavigationPartialRoute): route is Route<string, {backTo: string}> {
    return route.params !== undefined && 'backTo' in route.params && typeof route.params.backTo === 'string';
}

function isRouteWithReportID(route: NavigationPartialRoute): route is Route<string, {reportID: string}> {
    return route.params !== undefined && 'reportID' in route.params && typeof route.params.reportID === 'string';
}

function getMatchingFullScreenRoute(route: NavigationPartialRoute) {
    // Check for backTo param. One screen with different backTo value may need different screens visible under the overlay.
    if (isRouteWithBackToParam(route)) {
        const stateForBackTo = getStateFromPath(route.params.backTo, config);

        // This may happen if the backTo url is invalid.
        const lastRoute = stateForBackTo?.routes.at(-1);
        if (!stateForBackTo || !lastRoute || lastRoute.name === SCREENS.NOT_FOUND) {
            return undefined;
        }

        const isLastRouteFullScreen = isFullScreenName(lastRoute.name);

        // If the state for back to last route is a full screen route, we can use it
        if (isLastRouteFullScreen) {
            return lastRoute;
        }

        const focusedStateForBackToRoute = findFocusedRoute(stateForBackTo);

        if (!focusedStateForBackToRoute) {
            return undefined;
        }
        // If not, get the matching full screen route for the back to state.
        return getMatchingFullScreenRoute(focusedStateForBackToRoute);
    }

    if (RHP_TO_SEARCH[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_SEARCH[route.name]);
        const searchRoute = {
            name: RHP_TO_SEARCH[route.name],
            params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
        };
        return {
            name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
            state: getRoutesWithIndex([searchRoute]),
        };
    }

    if (RHP_TO_SIDEBAR[route.name]) {
        return getInitialSplitNavigatorState({
            name: RHP_TO_SIDEBAR[route.name],
        });
    }

    if (RHP_TO_WORKSPACE[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_WORKSPACE[route.name]);

        return getInitialSplitNavigatorState(
            {
                name: SCREENS.WORKSPACE.INITIAL,
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
            {
                name: RHP_TO_WORKSPACE[route.name],
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
        );
    }

    if (RHP_TO_SETTINGS[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RHP_TO_SETTINGS[route.name]);

        return getInitialSplitNavigatorState(
            {
                name: SCREENS.SETTINGS.ROOT,
            },
            {
                name: RHP_TO_SETTINGS[route.name],
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
        );
    }

    return undefined;
}

// If there is no particular matching route defined, we want to get the default route.
// It is the reports split navigator with report. If the reportID is defined in the focused route, we want to use it for the default report.
// This is separated from getMatchingFullScreenRoute because we want to use it only for the initial state.
// We don't want to make this route mandatory e.g. after deep linking or opening a specific flow.
function getDefaultFullScreenRoute(route?: NavigationPartialRoute) {
    // We will use it if the reportID is not defined. Router of this navigator has logic to fill it with a report.
    const fallbackRoute = {
        name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    };

    if (route && isRouteWithReportID(route)) {
        const reportID = route.params.reportID;

        if (!allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID) {
            return fallbackRoute;
        }

        return getInitialSplitNavigatorState(
            {
                name: SCREENS.HOME,
            },
            {
                name: SCREENS.REPORT,
                params: {reportID},
            },
        );
    }

    return fallbackRoute;
}

function getOnboardingAdaptedState(state: PartialState<NavigationState>): PartialState<NavigationState> {
    const onboardingRoute = state.routes.at(0);
    if (!onboardingRoute || onboardingRoute.name === SCREENS.ONBOARDING.PURPOSE || onboardingRoute.name === SCREENS.ONBOARDING.WORK_EMAIL) {
        return state;
    }

    const routes = [];
    routes.push({name: onboardingRoute.name === SCREENS.ONBOARDING.WORKSPACES ? SCREENS.ONBOARDING.PERSONAL_DETAILS : SCREENS.ONBOARDING.PURPOSE});
    if (onboardingRoute.name === SCREENS.ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS.ONBOARDING.EMPLOYEES});
    }
    routes.push(onboardingRoute);

    return getRoutesWithIndex(routes);
}

function getAdaptedState(state: PartialState<NavigationState<RootNavigatorParamList>>): GetAdaptedStateReturnType {
    const fullScreenRoute = state.routes.find((route) => isFullScreenName(route.name));
    const onboardingNavigator = state.routes.find((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
    const isWorkspaceSplitNavigator = fullScreenRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR;

    if (isWorkspaceSplitNavigator) {
        const workspacesListRoute = {name: SCREENS.WORKSPACES_LIST};
        return getRoutesWithIndex([workspacesListRoute, ...state.routes]);
    }

    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        const focusedRoute = findFocusedRoute(state);

        if (focusedRoute) {
            const matchingRootRoute = getMatchingFullScreenRoute(focusedRoute);

            // If there is a matching root route, add it to the state.
            if (matchingRootRoute) {
                const routes = [matchingRootRoute, ...state.routes];
                if (matchingRootRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                    const workspacesListRoute = {name: SCREENS.WORKSPACES_LIST};
                    routes.unshift(workspacesListRoute);
                }
                return getRoutesWithIndex(routes);
            }
        }

        const defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute);

        // The onboarding flow consists of several screens. If we open any of the screens, the previous screens from that flow should be in the state.
        if (onboardingNavigator?.state) {
            const adaptedOnboardingNavigator = {
                ...onboardingNavigator,
                state: getOnboardingAdaptedState(onboardingNavigator.state),
            };

            return getRoutesWithIndex([defaultFullScreenRoute, adaptedOnboardingNavigator]);
        }

        // If not, add the default full screen route.
        return getRoutesWithIndex([defaultFullScreenRoute, ...state.routes]);
    }

    return state;
}

/**
 * Generate a navigation state from a given path, adapting it to handle cases like onboarding flow,
 * displaying RHP screens and navigating in the Workspaces tab.
 * For detailed information about generating state from a path,
 * see the NAVIGATION.md documentation.
 *
 * @param path - The path to generate state from
 * @param options - Extra options to fine-tune how to parse the path
 * @param shouldReplacePathInNestedState - Whether to replace the path in nested state
 * @returns The adapted navigation state
 * @throws Error if unable to get state from path
 */
const getAdaptedStateFromPath: GetAdaptedStateFromPath = (path, options, shouldReplacePathInNestedState = true) => {
    let normalizedPath = !path.startsWith('/') ? `/${path}` : path;

    // Bing search results still link to /signin when searching for “Expensify”, but the /signin route no longer exists in our repo, so we redirect it to the home page to avoid showing a Not Found page.
    if (normalizedPath === CONST.SIGNIN_ROUTE) {
        normalizedPath = '/';
    }

    const state = getStateFromPath(normalizedPath, options) as PartialState<NavigationState<RootNavigatorParamList>>;
    if (shouldReplacePathInNestedState) {
        replacePathInNestedState(state, normalizedPath);
    }

    if (state === undefined) {
        throw new Error(`[getAdaptedStateFromPath] Unable to get state from path: ${path}`);
    }

    return getAdaptedState(state);
};

export default getAdaptedStateFromPath;
export {getMatchingFullScreenRoute, isFullScreenName};
