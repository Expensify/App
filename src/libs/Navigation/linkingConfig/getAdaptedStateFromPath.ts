import type {NavigationState, PartialState, Route} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import pick from 'lodash/pick';
import {isAnonymousUser} from '@libs/actions/Session';
import type {NavigationPartialRoute, RootStackParamList, SettingsSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isFullScreenName} from '@libs/NavigationUtils';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import * as ReportConnection from '@libs/ReportConnection';
import extractPolicyIDFromQuery from '@navigation/extractPolicyIDFromQuery';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import config from './config';
import createSplitNavigator from './createSplitNavigator';
import getParamsFromRoute from './getParamsFromRoute';
import RELATIONS from './RELATIONS';
import replacePathInNestedState from './replacePathInNestedState';

type GetAdaptedStateReturnType = {
    adaptedState: ReturnType<typeof getStateFromPath>;
};

type GetAdaptedStateFromPath = (...args: [...Parameters<typeof getStateFromPath>, shouldReplacePathInNestedState?: boolean]) => GetAdaptedStateReturnType;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function isRouteWithBackToParam(route: NavigationPartialRoute): route is Route<string, {backTo: string}> {
    return route.params !== undefined && 'backTo' in route.params && typeof route.params.backTo === 'string';
}

function isRouteWithReportID(route: NavigationPartialRoute): route is Route<string, {reportID: string}> {
    return route.params !== undefined && 'reportID' in route.params && typeof route.params.reportID === 'string';
}

function getMatchingFullScreenRoute(route: NavigationPartialRoute, policyID?: string) {
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
        return getMatchingFullScreenRoute(focusedStateForBackToRoute, policyID);
    }

    if (RELATIONS.SEARCH_TO_RHP.includes(route.name)) {
        const paramsFromRoute = getParamsFromRoute(SCREENS.SEARCH.CENTRAL_PANE);

        return {
            name: SCREENS.SEARCH.CENTRAL_PANE,
            params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
        };
    }

    if (RELATIONS.RHP_TO_SIDEBAR[route.name]) {
        return createSplitNavigator(
            {
                name: RELATIONS.RHP_TO_SIDEBAR[route.name],
            },
            undefined,
            policyID ? {policyID} : undefined,
        );
    }

    if (RELATIONS.RHP_TO_WORKSPACE[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RELATIONS.RHP_TO_WORKSPACE[route.name]);

        return createSplitNavigator(
            {
                name: SCREENS.WORKSPACE.INITIAL,
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
            {
                name: RELATIONS.RHP_TO_WORKSPACE[route.name],
                params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
            },
        );
    }

    if (RELATIONS.RHP_TO_SETTINGS[route.name]) {
        const paramsFromRoute = getParamsFromRoute(RELATIONS.RHP_TO_SETTINGS[route.name]);

        return createSplitNavigator(
            {
                name: SCREENS.SETTINGS.ROOT,
            },
            {
                name: RELATIONS.RHP_TO_SETTINGS[route.name],
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
function getDefaultFullScreenRoute(route?: NavigationPartialRoute, policyID?: string) {
    // We will use it if the reportID is not defined. Router of this navigator has logic to fill it with a report.
    const fallbackRoute = {
        name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    };

    if (route && isRouteWithReportID(route)) {
        const reportID = route.params.reportID;

        if (!ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID) {
            return fallbackRoute;
        }

        return createSplitNavigator(
            {
                name: SCREENS.HOME,
            },
            {
                name: SCREENS.REPORT,
                params: {reportID},
            },
            policyID ? {policyID} : undefined,
        );
    }

    return fallbackRoute;
}

function getOnboardingAdaptedState(state: PartialState<NavigationState>): PartialState<NavigationState> {
    const onboardingRoute = state.routes.at(0);
    if (!onboardingRoute || onboardingRoute.name === SCREENS.ONBOARDING.PURPOSE) {
        return state;
    }

    const routes = [];
    routes.push({name: SCREENS.ONBOARDING.PURPOSE});
    if (onboardingRoute.name === SCREENS.ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS.ONBOARDING.EMPLOYEES});
    }
    routes.push(onboardingRoute);

    return getRoutesWithIndex(routes);
}

function getAdaptedState(state: PartialState<NavigationState<RootStackParamList>>, policyID?: string): GetAdaptedStateReturnType {
    const fullScreenRoute = state.routes.find((route) => isFullScreenName(route.name));
    const reportsSplitNavigator = state.routes.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    const onboardingNavigator = state.routes.find((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);

    // If policyID is defined, it should be passed to the reportNavigator params.
    if (reportsSplitNavigator && policyID) {
        const routes = [];
        const reportNavigatorWithPolicyID = {...reportsSplitNavigator};
        reportNavigatorWithPolicyID.params = {...reportNavigatorWithPolicyID.params, policyID};
        routes.push(reportNavigatorWithPolicyID);

        return {
            adaptedState: getRoutesWithIndex(routes),
        };
    }

    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        const focusedRoute = findFocusedRoute(state);

        if (focusedRoute) {
            const matchingRootRoute = getMatchingFullScreenRoute(focusedRoute, policyID);
            // If there is a matching root route, add it to the state.
            if (matchingRootRoute) {
                return {
                    adaptedState: getRoutesWithIndex([matchingRootRoute, ...state.routes]),
                };
            }
        }

        const defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute, policyID);

        // The onboarding flow consists of several screens. If we open any of the screens, the previous screens from that flow should be in the state.
        if (onboardingNavigator?.state) {
            const adaptedOnboardingNavigator = {
                ...onboardingNavigator,
                state: getOnboardingAdaptedState(onboardingNavigator.state),
            };

            return {
                adaptedState: getRoutesWithIndex([defaultFullScreenRoute, adaptedOnboardingNavigator]),
            };
        }

        // If not, add the default full screen route.
        return {
            adaptedState: getRoutesWithIndex([defaultFullScreenRoute, ...state.routes]),
        };
    }

    return {
        adaptedState: state,
    };
}

const getAdaptedStateFromPath: GetAdaptedStateFromPath = (path, options, shouldReplacePathInNestedState = true) => {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const pathWithoutPolicyID = getPathWithoutPolicyID(normalizedPath);
    const isAnonymous = isAnonymousUser();

    // Anonymous users don't have access to workspaces
    const policyID = isAnonymous ? undefined : extractPolicyIDFromPath(path);

    const state = getStateFromPath(pathWithoutPolicyID, options) as PartialState<NavigationState<RootStackParamList>>;
    if (shouldReplacePathInNestedState) {
        replacePathInNestedState(state, normalizedPath);
    }

    if (state === undefined) {
        throw new Error('Unable to parse path');
    }

    // On SCREENS.SEARCH.CENTRAL_PANE policyID is stored differently inside search query ("q" param), so we're handling this case
    const focusedRoute = findFocusedRoute(state);
    const policyIDFromQuery = extractPolicyIDFromQuery(focusedRoute);
    return getAdaptedState(state, policyID ?? policyIDFromQuery);
};

export default getAdaptedStateFromPath;
export {getMatchingFullScreenRoute, isFullScreenName};
