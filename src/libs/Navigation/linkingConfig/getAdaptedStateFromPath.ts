import type {NavigationState, PartialState, Route} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import pick from 'lodash/pick';
import type {TupleToUnion} from 'type-fest';
import {isAnonymousUser} from '@libs/actions/Session';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import type {NavigationPartialRoute, RootStackParamList, SplitNavigatorScreenName} from '@libs/Navigation/types';
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
import createSplitNavigator from './createSplitNavigator';
import replacePathInNestedState from './replacePathInNestedState';
import SEARCH_RHP_SCREENS from './SEARCH_RHP_SCREENS';
import {CENTRAL_PANE_TO_TAB_MAPPING} from './TAB_TO_CENTRAL_PANE_MAPPING';

const RHP_SCREENS_OPENED_FROM_LHN = [
    SCREENS.SETTINGS.SHARE_CODE,
    SCREENS.SETTINGS.PROFILE.STATUS,
    SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE,
    SCREENS.MONEY_REQUEST.CREATE,
    SCREENS.SETTINGS.EXIT_SURVEY.REASON,
    SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE,
    SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM,
] satisfies Screen[];

const mapLhnToSplitNavigatorName = {
    [SCREENS.SETTINGS.ROOT]: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    [SCREENS.HOME]: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    [SCREENS.WORKSPACE.INITIAL]: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
};

type RHPScreenOpenedFromLHN = TupleToUnion<typeof RHP_SCREENS_OPENED_FROM_LHN>;

type Metainfo = {
    // Sometimes modal screens don't have information about what should be visible under the overlay.
    // That means such screen can have different screens under the overlay depending on what was already in the state.
    // If the screens in the bottom tab and central pane are not mandatory for this state, we want to have this information.
    // It will help us later with creating proper diff betwen current and desired state.
    isCentralPaneAndBottomTabMandatory: boolean;
    isWorkspaceNavigatorMandatory: boolean;
};

type GetAdaptedStateReturnType = {
    adaptedState: ReturnType<typeof getStateFromPath>;
    // metainfo: Metainfo;
};

type GetAdaptedStateFromPath = (...args: [...Parameters<typeof getStateFromPath>, shouldReplacePathInNestedState?: boolean]) => GetAdaptedStateReturnType;

type SplitNavigatorLHNScreen = keyof typeof mapLhnToSplitNavigatorName;
type SplitNavigator = (typeof mapLhnToSplitNavigatorName)[SplitNavigatorLHNScreen];

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function getParamsFromRoute(screenName: string): string[] {
    const routeConfig = normalizedConfigs[screenName as Screen];

    const route = routeConfig.pattern;

    return route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g) ?? [];
}

// This function will return CentralPaneNavigator route or WorkspaceNavigator route.
function getMatchingRootRouteForRHPRoute(route: NavigationPartialRoute): NavigationPartialRoute<SplitNavigator> | NavigationPartialRoute<'Search_Central_Pane'> | undefined {
    // Check for backTo param. One screen with different backTo value may need diferent screens visible under the overlay.
    if (route.params && 'backTo' in route.params && typeof route.params.backTo === 'string') {
        const stateForBackTo = getStateFromPath(route.params.backTo, config);
        if (stateForBackTo) {
            // If there is rhpNavigator in the state generated for backTo url, we want to get root route matching to this rhp screen.
            const rhpNavigator = stateForBackTo.routes.find((rt) => rt.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
            if (rhpNavigator && rhpNavigator.state) {
                const isRHPinState = stateForBackTo.routes.at(0)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

                if (isRHPinState) {
                    return getMatchingRootRouteForRHPRoute(findFocusedRoute(stateForBackTo) as NavigationPartialRoute);
                }
            }

            // If we know that backTo targets the root route (full screen) we want to use it.
            const fullScreenNavigator = stateForBackTo.routes.find((rt) => rt.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
            if (fullScreenNavigator && fullScreenNavigator.state) {
                return fullScreenNavigator as NavigationPartialRoute<CentralPaneName | typeof NAVIGATORS.WORKSPACE_NAVIGATOR>;
            }

            // If we know that backTo targets a central pane screen we want to use it.
            const centralPaneScreen = stateForBackTo.routes.find((rt) => isCentralPaneName(rt.name));
            if (centralPaneScreen) {
                return centralPaneScreen as NavigationPartialRoute<CentralPaneName | typeof NAVIGATORS.WORKSPACE_NAVIGATOR>;
            }
        }
    }

    // Check for CentralPaneNavigator
    for (const [centralPaneName, RHPNames] of Object.entries(CENTRAL_PANE_TO_RHP_MAPPING)) {
        if (RHPNames.includes(route.name)) {
            const paramsFromRoute = getParamsFromRoute(centralPaneName);
            return createSplitNavigator(
                {name: CENTRAL_PANE_TO_TAB_MAPPING[centralPaneName as SplitNavigatorScreenName] as SplitNavigatorLHNScreen, params: pick(route.params, paramsFromRoute)},
                {
                    name: centralPaneName,
                    params: pick(route.params, paramsFromRoute),
                },
            );
        }
    }

    if (SEARCH_RHP_SCREENS.includes(route.name)) {
        const paramsFromRoute = getParamsFromRoute(SCREENS.SEARCH.CENTRAL_PANE);

        return {
            name: SCREENS.SEARCH.CENTRAL_PANE,
            params: pick(route.params, paramsFromRoute),
        };
    }

    // check for valid reportID in the route params
    // if the reportID is valid, we should navigate back to screen report in CPN
    const reportID = (route.params as Record<string, string | undefined>)?.reportID;
    if (ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID) {
        return createSplitNavigator({name: SCREENS.HOME}, {name: SCREENS.REPORT, params: {reportID}});
    }
}

function getAdaptedState(state: PartialState<NavigationState<RootStackParamList>>, policyID?: string): GetAdaptedStateReturnType {
    const isNarrowLayout = getIsNarrowLayout();
    // const metainfo = {
    //     isCentralPaneAndBottomTabMandatory: true,
    //     isWorkspaceNavigatorMandatory: true,
    // };

    // We need to check what is defined to know what we need to add.
    const WorkspaceNavigator = state.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);
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
            // This may happen if this RHP doesn't have a route that should be under the overlay defined.
            if (!matchingRootRoute || isRHPScreenOpenedFromLHN) {
                // metainfo.isCentralPaneAndBottomTabMandatory = false;
                // metainfo.isWorkspaceNavigatorMandatory = false;
                // If matchingRootRoute is undefined and it's a narrow layout, don't add a report screen under the RHP.
                matchingRootRoute = matchingRootRoute ?? (!isNarrowLayout ? createSplitNavigator({name: SCREENS.HOME}, {name: SCREENS.REPORT}) : createSplitNavigator({name: SCREENS.HOME}));
            }

            // When we open a screen in RHP from WorkspaceNavigator, we need to add the appropriate screen in CentralPane.
            // Then, when we close WorkspaceNavigator, we will be redirected to the correct page in CentralPane.
            if (matchingRootRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                routes.push(createSplitNavigator({name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.WORKSPACES}));
            }

            if (matchingRootRoute && (!isNarrowLayout || !isRHPScreenOpenedFromLHN)) {
                routes.push(matchingRootRoute);
            }
        }

        routes.push(rhpNavigator);
        return {
            adaptedState: getRoutesWithIndex(routes),
            // metainfo,
        };
    }
    if (lhpNavigator ?? onboardingModalNavigator ?? welcomeVideoModalNavigator ?? featureTrainingModalNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found lhp / onboardingModalNavigator

        // There is no screen in these navigators that would have mandatory central pane, bottom tab or workspace navigator.
        // metainfo.isCentralPaneAndBottomTabMandatory = false;
        // metainfo.isWorkspaceNavigatorMandatory = false;
        const routes = [];

        const splitNavigatorMainScreen = !isNarrowLayout
            ? {
                  name: SCREENS.REPORT,
              }
            : undefined;

        routes.push(createSplitNavigator({name: SCREENS.HOME}, splitNavigatorMainScreen));

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
        };
    }
    if (WorkspaceNavigator) {
        // Routes
        // - default bottom tab
        // - default central pane on desktop layout
        // - found workspace navigator

        const routes = [];
        routes.push(
            createSplitNavigator(
                {name: SCREENS.SETTINGS.ROOT},
                {
                    name: SCREENS.SETTINGS.WORKSPACES,
                    params: {
                        policyID,
                    },
                },
            ),
        );

        routes.push(WorkspaceNavigator);

        return {
            adaptedState: getRoutesWithIndex(routes),
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
            const splitNavigatorMainScreen = !isNarrowLayout
                ? {
                      name: SCREENS.REPORT,
                      params: {reportID: reportAttachments.params?.reportID ?? '-1'},
                  }
                : undefined;

            routes.push(createSplitNavigator({name: SCREENS.HOME}, splitNavigatorMainScreen));
            routes.push(reportAttachments);

            return {
                adaptedState: getRoutesWithIndex(routes),
            };
        }
    }

    // We need to make sure that this if only handles states where we deeplink to the bottom tab directly
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
export type {Metainfo};
