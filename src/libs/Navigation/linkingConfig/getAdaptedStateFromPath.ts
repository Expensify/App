import type {NavigationState, PartialState, Route} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import pick from 'lodash/pick';
import {isAnonymousUser} from '@libs/actions/Session';
import type {NavigationPartialRoute, RootStackParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
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

function getMatchingFullScreenRouteForState(state: PartialState<NavigationState<RootStackParamList>>) {
    const focusedRoute = findFocusedRoute(state);

    if (!focusedRoute) {
        return undefined;
    }

    // Check for backTo param. One screen with different backTo value may need different screens visible under the overlay.
    if (isRouteWithBackToParam(focusedRoute)) {
        const stateForBackTo = getStateFromPath(focusedRoute.params.backTo, config);

        // This may happen if the backTo url is invalid.
        const lastRoute = stateForBackTo?.routes.at(-1);
        if (!stateForBackTo || !lastRoute || lastRoute.name === SCREENS.NOT_FOUND) {
            return undefined;
        }

        const isLastRouteFullScreen = isFullScreenRoute(lastRoute);

        // If the state for back to last route is a full screen route, we can use it
        if (isLastRouteFullScreen) {
            return lastRoute;
        }

        // If not, get the matching full screen route for the back to state.
        return getMatchingFullScreenRouteForState(stateForBackTo as PartialState<NavigationState<RootStackParamList>>);
    }

    if (RELATIONS.SEARCH_TO_RHP.includes(focusedRoute.name)) {
        const paramsFromRoute = getParamsFromRoute(SCREENS.SEARCH.CENTRAL_PANE);

        return {
            name: SCREENS.SEARCH.CENTRAL_PANE,
            params: pick(focusedRoute.params, paramsFromRoute),
        };
    }

    if (RELATIONS.RHP_TO_SIDEBAR[focusedRoute.name]) {
        // @TODO: Figure out better types for this.
        return createSplitNavigator({
            name: RELATIONS.RHP_TO_SIDEBAR[focusedRoute.name] as typeof SCREENS.HOME,
        });
    }

    // @TODO We can think about handling it in one condition.
    if (RELATIONS.RHP_TO_WORKSPACE[focusedRoute.name]) {
        const paramsFromRoute = getParamsFromRoute(SCREENS.SEARCH.CENTRAL_PANE);

        return createSplitNavigator(
            {
                name: SCREENS.WORKSPACE.INITIAL,
            },
            {
                name: RELATIONS.RHP_TO_WORKSPACE[focusedRoute.name],
                params: {
                    ...pick(focusedRoute.params, paramsFromRoute),
                },
            },
        );
    }

    if (RELATIONS.RHP_TO_SETTINGS[focusedRoute.name]) {
        const paramsFromRoute = getParamsFromRoute(SCREENS.SEARCH.CENTRAL_PANE);

        return createSplitNavigator(
            {
                name: SCREENS.SETTINGS.ROOT,
            },
            {
                name: RELATIONS.RHP_TO_SETTINGS[focusedRoute.name] as keyof SettingsSplitNavigatorParamList,
                params: {
                    ...pick(focusedRoute.params, paramsFromRoute),
                },
            },
        );
    }

    // @TODO should we push this route on narrow layout?
    if (isRouteWithReportID(focusedRoute)) {
        const reportID = focusedRoute.params.reportID;
        const paramsFromRoute = getParamsFromRoute(SCREENS.REPORT);

        if (!ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID) {
            return;
        }

        return createSplitNavigator(
            {
                name: SCREENS.HOME,
            },
            {
                name: SCREENS.REPORT,
                params: {
                    reportID: '-1',
                    ...pick(focusedRoute.params, paramsFromRoute),
                },
            },
        );
    }

    return undefined;
}

const FULL_SCREEN_ROUTES: string[] = [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SEARCH.CENTRAL_PANE];

function isFullScreenRoute(route: NavigationPartialRoute): boolean {
    return FULL_SCREEN_ROUTES.includes(route.name);
}

function getAdaptedState(state: PartialState<NavigationState<RootStackParamList>>, policyID?: string): GetAdaptedStateReturnType {
    const fullScreenRoute = state.routes.find(isFullScreenRoute);
    const reportsSplitNavigator = state.routes.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

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
        const matchingRootRoute = getMatchingFullScreenRouteForState(state);

        // If there is a matching root route, add it to the state.
        if (matchingRootRoute) {
            return {
                adaptedState: getRoutesWithIndex([matchingRootRoute, ...state.routes]),
            };
        }

        // If not, add the default full screen route.
        return {
            adaptedState: getRoutesWithIndex([{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, ...state.routes]),
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
        replacePathInNestedState(state, path);
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
