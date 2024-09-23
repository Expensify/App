import type {NavigationState, PartialState, Route} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import pick from 'lodash/pick';
import type {TupleToUnion} from 'type-fest';
import {isAnonymousUser} from '@libs/actions/Session';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import type {BottomTabName, CentralPaneName, FullScreenName, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import {isCentralPaneName} from '@libs/NavigationUtils';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import * as ReportConnection from '@libs/ReportConnection';
import extractPolicyIDFromQuery from '@navigation/extractPolicyIDFromQuery';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import CENTRAL_PANE_TO_RHP_MAPPING from './CENTRAL_PANE_TO_RHP_MAPPING';
import config, {normalizedConfigs} from './config';
import FULL_SCREEN_TO_RHP_MAPPING from './FULL_SCREEN_TO_RHP_MAPPING';
import getMatchingBottomTabRouteForState from './getMatchingBottomTabRouteForState';
import getMatchingCentralPaneRouteForState from './getMatchingCentralPaneRouteForState';
import replacePathInNestedState from './replacePathInNestedState';

const RHP_SCREENS_OPENED_FROM_LHN = [
    SCREENS.SETTINGS.SHARE_CODE,
    SCREENS.SETTINGS.PROFILE.STATUS,
    SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE,
    SCREENS.MONEY_REQUEST.CREATE,
    SCREENS.SETTINGS.EXIT_SURVEY.REASON,
    SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE,
    SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM,
] satisfies Screen[];

type RHPScreenOpenedFromLHN = TupleToUnion<typeof RHP_SCREENS_OPENED_FROM_LHN>;

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

type GetAdaptedStateFromPath = (...args: [...Parameters<typeof getStateFromPath>, shouldReplacePathInNestedState?: boolean]) => GetAdaptedStateReturnType;

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
    const routesForBottomTabNavigator: Array<NavigationPartialRoute<BottomTabName>> = [];
    routesForBottomTabNavigator.push(addPolicyIDToRoute(route, policyID) as NavigationPartialRoute<BottomTabName>);

    return {
        name: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
        state: getRoutesWithIndex(routesForBottomTabNavigator),
    };
}

function createFullScreenNavigator(route?: NavigationPartialRoute<FullScreenName>): NavigationPartialRoute<typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR> {
    const routes = [];

    const policyID = route?.params && 'policyID' in route.params ? route.params.policyID : undefined;

    // Both routes in FullScreenNavigator should store a policyID in params, so here this param is also passed to the screen displayed in LHN in FullScreenNavigator
    routes.push({
        name: SCREENS.WORKSPACE.INITIAL,
        params: {
            policyID,
        },
    });

    if (route) {
        routes.push(route);
    }
    return {
        name: NAVIGATORS.FULL_SCREEN_NAVIGATOR,
        state: getRoutesWithIndex(routes),
    };
}

function getParamsFromRoute(screenName: string): string[] {
    const routeConfig = normalizedConfigs[screenName as Screen];

    const route = routeConfig.pattern;

    return route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g) ?? [];
}

// This function will return CentralPaneNavigator route or FullScreenNavigator route.
function getMatchingRootRouteForRHPRoute(route: NavigationPartialRoute): NavigationPartialRoute<CentralPaneName | typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR> | undefined {
    // Check for backTo param. One screen with different backTo value may need diferent screens visible under the overlay.
    if (route.params && 'backTo' in route.params && typeof route.params.backTo === 'string') {
        const stateForBackTo = getStateFromPath(route.params.backTo, config);
        if (stateForBackTo) {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const rhpNavigator = stateForBackTo.routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

            const centralPaneOrFullScreenNavigator = stateForBackTo.routes.find(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                (route) => isCentralPaneName(route.name) || route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR,
            );

            // If there is rhpNavigator in the state generated for backTo url, we want to get root route matching to this rhp screen.
            if (rhpNavigator && rhpNavigator.state) {
                return getMatchingRootRouteForRHPRoute(findFocusedRoute(stateForBackTo) as NavigationPartialRoute);
            }

            // If we know that backTo targets the root route (central pane or full screen) we want to use it.
            if (centralPaneOrFullScreenNavigator && centralPaneOrFullScreenNavigator.state) {
                return centralPaneOrFullScreenNavigator as NavigationPartialRoute<CentralPaneName | typeof NAVIGATORS.FULL_SCREEN_NAVIGATOR>;
            }
        }
    }

    // Check for CentralPaneNavigator
    for (const [centralPaneName, RHPNames] of Object.entries(CENTRAL_PANE_TO_RHP_MAPPING)) {
        if (RHPNames.includes(route.name)) {
            const paramsFromRoute = getParamsFromRoute(centralPaneName);

            return {name: centralPaneName as CentralPaneName, params: pick(route.params, paramsFromRoute)};
        }
    }

    // Check for FullScreenNavigator
    for (const [fullScreenName, RHPNames] of Object.entries(FULL_SCREEN_TO_RHP_MAPPING)) {
        if (RHPNames.includes(route.name)) {
            const paramsFromRoute = getParamsFromRoute(fullScreenName);

            return createFullScreenNavigator({name: fullScreenName as FullScreenName, params: pick(route.params, paramsFromRoute)});
        }
    }

    // check for valid reportID in the route params
    // if the reportID is valid, we should navigate back to screen report in CPN
    const reportID = (route.params as Record<string, string | undefined>)?.reportID;
    if (ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID) {
        return {name: SCREENS.REPORT, params: {reportID}};
    }
}

function getAdaptedState(state: PartialState<NavigationState<RootStackParamList>>, policyID?: string): GetAdaptedStateReturnType {
    const isNarrowLayout = getIsNarrowLayout();
    const metainfo = {
        isCentralPaneAndBottomTabMandatory: true,
        isFullScreenNavigatorMandatory: true,
    };

    // We need to check what is defined to know what we need to add.
    const bottomTabNavigator = state.routes.find((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
    const centralPaneNavigator = state.routes.find((route) => isCentralPaneName(route.name));
    const fullScreenNavigator = state.routes.find((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR);
    const rhpNavigator = state.routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const lhpNavigator = state.routes.find((route) => route.name === NAVIGATORS.LEFT_MODAL_NAVIGATOR);
    const onboardingModalNavigator = state.routes.find((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
    const welcomeVideoModalNavigator = state.routes.find((route) => route.name === NAVIGATORS.WELCOME_VIDEO_MODAL_NAVIGATOR);
    const attachmentsScreen = state.routes.find((route) => route.name === SCREENS.ATTACHMENTS);
    const featureTrainingModalNavigator = state.routes.find((route) => route.name === NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR);

    if (rhpNavigator) {
        // Routes
        // - matching bottom tab
        // - matching root route for rhp
        // - found rhp

        // This one will be defined because rhpNavigator is defined.
        const focusedRHPRoute = findFocusedRoute(state);
        const routes = [];

        if (focusedRHPRoute) {
            let matchingRootRoute = getMatchingRootRouteForRHPRoute(focusedRHPRoute);
            const isRHPScreenOpenedFromLHN = focusedRHPRoute?.name && RHP_SCREENS_OPENED_FROM_LHN.includes(focusedRHPRoute?.name as RHPScreenOpenedFromLHN);
            // This may happen if this RHP doens't have a route that should be under the overlay defined.
            if (!matchingRootRoute || isRHPScreenOpenedFromLHN) {
                metainfo.isCentralPaneAndBottomTabMandatory = false;
                metainfo.isFullScreenNavigatorMandatory = false;
                // If matchingRootRoute is undefined and it's a narrow layout, don't add a report screen under the RHP.
                matchingRootRoute = matchingRootRoute ?? (!isNarrowLayout ? {name: SCREENS.REPORT} : undefined);
            }

            // If the root route is type of FullScreenNavigator, the default bottom tab will be added.
            const matchingBottomTabRoute = getMatchingBottomTabRouteForState({routes: matchingRootRoute ? [matchingRootRoute] : []});
            routes.push(createBottomTabNavigator(matchingBottomTabRoute, policyID));
            // When we open a screen in RHP from FullScreenNavigator, we need to add the appropriate screen in CentralPane.
            // Then, when we close FullScreenNavigator, we will be redirected to the correct page in CentralPane.
            if (matchingRootRoute?.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR) {
                routes.push({name: SCREENS.SETTINGS.WORKSPACES});
            }

            if (matchingRootRoute && (!isNarrowLayout || !isRHPScreenOpenedFromLHN)) {
                routes.push(matchingRootRoute);
            }
        }

        routes.push(rhpNavigator);
        return {
            adaptedState: getRoutesWithIndex(routes),
            metainfo,
        };
    }
    if (lhpNavigator ?? onboardingModalNavigator ?? welcomeVideoModalNavigator ?? featureTrainingModalNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found lhp / onboardingModalNavigator

        // There is no screen in these navigators that would have mandatory central pane, bottom tab or fullscreen navigator.
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
        if (!isNarrowLayout) {
            routes.push({
                name: SCREENS.REPORT,
            });
        }

        // Separate ifs are necessary for typescript to see that we are not pushing undefined to the array.
        if (lhpNavigator) {
            routes.push(lhpNavigator);
        }

        if (onboardingModalNavigator) {
            routes.push(onboardingModalNavigator);
        }

        if (welcomeVideoModalNavigator) {
            routes.push(welcomeVideoModalNavigator);
        }

        if (featureTrainingModalNavigator) {
            routes.push(featureTrainingModalNavigator);
        }

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

        const routes = [];
        routes.push(
            createBottomTabNavigator(
                {
                    name: SCREENS.SETTINGS.ROOT,
                },
                policyID,
            ),
        );

        routes.push({
            name: SCREENS.SETTINGS.WORKSPACES,
        });

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
    if (attachmentsScreen) {
        // Routes
        // - matching bottom tab
        // - central pane (report screen) of the attachment
        // - found report attachments
        const routes = [];
        const reportAttachments = attachmentsScreen as Route<'Attachments', RootStackParamList['Attachments']>;

        if (reportAttachments.params?.type === CONST.ATTACHMENT_TYPE.REPORT) {
            const matchingBottomTabRoute = getMatchingBottomTabRouteForState(state);
            routes.push(createBottomTabNavigator(matchingBottomTabRoute, policyID));
            if (!isNarrowLayout) {
                routes.push({name: SCREENS.REPORT, params: {reportID: reportAttachments.params?.reportID ?? '-1'}});
            }
            routes.push(reportAttachments);

            return {
                adaptedState: getRoutesWithIndex(routes),
                metainfo,
            };
        }
    }

    // We need to make sure that this if only handles states where we deeplink to the bottom tab directly
    if (bottomTabNavigator && bottomTabNavigator.state) {
        // Routes
        // - found bottom tab
        // - matching central pane on desktop layout

        // We want to make sure that the bottom tab search page is always pushed with matching central pane page. Even on the narrow layout.
        if (isNarrowLayout && bottomTabNavigator.state?.routes[0].name !== SCREENS.SEARCH.BOTTOM_TAB) {
            return {
                adaptedState: state,
                metainfo,
            };
        }

        const routes = [...state.routes];
        const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(state);
        if (matchingCentralPaneRoute) {
            routes.push(matchingCentralPaneRoute);
        } else {
            // If there is no matching central pane, we want to add the default one.
            metainfo.isCentralPaneAndBottomTabMandatory = false;
            routes.push({name: SCREENS.REPORT});
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
export type {Metainfo};
