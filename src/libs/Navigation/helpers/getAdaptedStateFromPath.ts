import type {NavigationState, PartialState, Route} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import pick from 'lodash/pick';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {isAnonymousUser} from '@libs/actions/Session';
import getInitialSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState';
import {config} from '@libs/Navigation/linkingConfig/config';
import {RHP_TO_SETTINGS, RHP_TO_SIDEBAR, RHP_TO_WORKSPACE, SEARCH_TO_RHP} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute, RootNavigatorParamList} from '@libs/Navigation/types';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import extractPolicyIDFromQuery from './extractPolicyIDFromQuery';
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

    if (SEARCH_TO_RHP.includes(route.name)) {
        const paramsFromRoute = getParamsFromRoute(SCREENS.SEARCH.ROOT);

        return {
            name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
            params: paramsFromRoute.length > 0 ? pick(route.params, paramsFromRoute) : undefined,
        };
    }

    if (RHP_TO_SIDEBAR[route.name]) {
        return getInitialSplitNavigatorState(
            {
                name: RHP_TO_SIDEBAR[route.name],
            },
            undefined,
            policyID ? {policyID} : undefined,
        );
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
function getDefaultFullScreenRoute(route?: NavigationPartialRoute, policyID?: string) {
    // We will use it if the reportID is not defined. Router of this navigator has logic to fill it with a report.
    const fallbackRoute = {
        name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
        params: policyID ? {policyID} : undefined,
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

function getAdaptedState(state: PartialState<NavigationState<RootNavigatorParamList>>, policyID?: string): GetAdaptedStateReturnType {
    const fullScreenRoute = state.routes.find((route) => isFullScreenName(route.name));
    const onboardingNavigator = state.routes.find((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
    const isReportSplitNavigator = fullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
    const isWorkspaceSplitNavigator = fullScreenRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR;

    // If policyID is defined, it should be passed to the reportNavigator params.
    if (isReportSplitNavigator && policyID) {
        const routes = [];
        const reportNavigatorWithPolicyID = {...fullScreenRoute};
        reportNavigatorWithPolicyID.params = {...reportNavigatorWithPolicyID.params, policyID};
        routes.push(reportNavigatorWithPolicyID);

        return getRoutesWithIndex(routes);
    }

    if (isWorkspaceSplitNavigator) {
        const settingsSplitRoute = getInitialSplitNavigatorState({name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.WORKSPACES});
        return getRoutesWithIndex([settingsSplitRoute, ...state.routes]);
    }

    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        const focusedRoute = findFocusedRoute(state);

        if (focusedRoute) {
            const matchingRootRoute = getMatchingFullScreenRoute(focusedRoute, policyID);

            // If there is a matching root route, add it to the state.
            if (matchingRootRoute) {
                const routes = [matchingRootRoute, ...state.routes];
                if (matchingRootRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                    const settingsSplitRoute = getInitialSplitNavigatorState({name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.WORKSPACES});
                    routes.unshift(settingsSplitRoute);
                }
                return getRoutesWithIndex(routes);
            }
        }

        const defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute, policyID);

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

const getAdaptedStateFromPath: GetAdaptedStateFromPath = (path, options, shouldReplacePathInNestedState = true) => {
    const normalizedPath = !path.startsWith('/') ? `/${path}` : path;
    const pathWithoutPolicyID = getPathWithoutPolicyID(normalizedPath);
    const isAnonymous = isAnonymousUser();

    // Anonymous users don't have access to workspaces
    const policyID = isAnonymous ? undefined : extractPolicyIDFromPath(path);

    const state = getStateFromPath(pathWithoutPolicyID, options) as PartialState<NavigationState<RootNavigatorParamList>>;
    if (shouldReplacePathInNestedState) {
        replacePathInNestedState(state, normalizedPath);
    }

    if (state === undefined) {
        throw new Error(`[getAdaptedStateFromPath] Unable to get state from path: ${path}`);
    }

    // On SCREENS.SEARCH.ROOT policyID is stored differently inside search query ("q" param), so we're handling this case
    const focusedRoute = findFocusedRoute(state);
    const policyIDFromQuery = extractPolicyIDFromQuery(focusedRoute);
    return getAdaptedState(state, policyID ?? policyIDFromQuery);
};

export default getAdaptedStateFromPath;
export {getMatchingFullScreenRoute, isFullScreenName};
