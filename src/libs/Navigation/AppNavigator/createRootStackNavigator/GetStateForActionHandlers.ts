import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import Log from '@libs/Log';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {OpenWorkspaceSplitActionType, PushActionType, ReplaceActionType, SwitchPolicyIdActionType} from './types';

const MODAL_ROUTES_TO_DISMISS: string[] = [
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS.LEFT_MODAL_NAVIGATOR,
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR,
    NAVIGATORS.SHARE_MODAL_NAVIGATOR,
    NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR,
    SCREENS.NOT_FOUND,
    SCREENS.ATTACHMENTS,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.REPORT_AVATAR,
    SCREENS.CONCIERGE,
];

const SPLIT_TO_CONDITION = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: (screen: string | undefined) => screen === SCREENS.REPORT, // ReportScreen should always be opened with an animation
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: (screen: string | undefined) => screen !== SCREENS.SETTINGS.ROOT, // Transitioning to all central screens in settings should be animated
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: (screen: string | undefined) => screen === SCREENS.SEARCH.MONEY_REQUEST_REPORT, // Transitioning to SCREENS.SEARCH.MONEY_REQUEST_REPORT should be animated
    [NAVIGATORS.WORKSPACE_HUB_SPLIT_NAVIGATOR]: (screen: string | undefined) => screen !== SCREENS.WORKSPACE_HUB.ROOT, // Transitioning to all central screens in workspace hub should be animated
};

const workspaceSplitsWithoutEnteringAnimation = new Set<string>();

const screensWithEnteringAnimation = new Set<string>();
/**
 * Handles the OPEN_WORKSPACE_SPLIT action.
 * If the user is on other tab than workspaces and the workspace split is "remembered", this action will be called after pressing the settings tab.
 * It will push the workspace hub split navigator first and then push the workspace split navigator.
 * This allows the user to swipe back on the iOS to the workspace hub split navigator underneath.
 */
function handleOpenWorkspaceSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: OpenWorkspaceSplitActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const actionToPushWorkspaceHubSplitNavigator = StackActions.push(NAVIGATORS.WORKSPACE_HUB_SPLIT_NAVIGATOR, {
        screen: SCREENS.WORKSPACE_HUB.WORKSPACES,
    });

    const actionToPushWorkspaceSplitNavigator = StackActions.push(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {
            policyID: action.payload.policyID,
        },
    });

    const stateWithWorkspaceHubSplitNavigator = stackRouter.getStateForAction(state, actionToPushWorkspaceHubSplitNavigator, configOptions);

    if (!stateWithWorkspaceHubSplitNavigator) {
        Log.hmmm('[handleOpenWorkspaceSplitAction] SettingsSplitNavigator has not been found in the navigation state.');
        return null;
    }

    const rehydratedStateWithSettingsSplitNavigator = stackRouter.getRehydratedState(stateWithWorkspaceHubSplitNavigator, configOptions);
    const stateWithWorkspaceSplitNavigator = stackRouter.getStateForAction(rehydratedStateWithSettingsSplitNavigator, actionToPushWorkspaceSplitNavigator, configOptions);

    if (!stateWithWorkspaceSplitNavigator) {
        Log.hmmm('[handleOpenWorkspaceSplitAction] WorkspaceSplitNavigator has not been found in the navigation state.');
        return null;
    }

    const lastFullScreenRoute = stateWithWorkspaceSplitNavigator.routes.at(-1);

    if (lastFullScreenRoute?.key) {
        // If the user opened the workspace split navigator from a different tab, we don't want to animate the entering transition.
        // To make it feel like bottom tab navigator.
        workspaceSplitsWithoutEnteringAnimation.add(lastFullScreenRoute.key);
    }

    return stateWithWorkspaceSplitNavigator;
}

/**
 * Handles the SWITCH_POLICY_ID action for `SearchFullscreenNavigator`.
 * Information about the currently selected policy can be found in the last Search_Root.
 * After user changes the policy while on Search, a new Search_Root with the changed policy inside query param has to be pushed to the navigation state.
 */
function handleSwitchPolicyIDFromSearchAction(
    state: StackNavigationState<ParamListBase>,
    action: SwitchPolicyIdActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
    const lastRoute = state.routes.at(-1);
    if (lastRoute?.name === SCREENS.SEARCH.ROOT) {
        const currentParams = lastRoute.params as RootNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
        const queryJSON = SearchQueryUtils.buildSearchQueryJSON(currentParams.q);
        if (!queryJSON) {
            return null;
        }

        if (action.payload.policyID) {
            queryJSON.policyID = action.payload.policyID;
        } else {
            delete queryJSON.policyID;
        }

        const newAction = StackActions.push(SCREENS.SEARCH.ROOT, {
            ...currentParams,
            q: SearchQueryUtils.buildSearchQueryString(queryJSON),
        });

        setActiveWorkspaceID(action.payload.policyID);
        return stackRouter.getStateForAction(state, newAction, configOptions);
    }
    // We don't have other navigators that should handle switch policy action.
    return null;
}

/**
 * Handles the SWITCH_POLICY_ID action for `ReportsSplitNavigator`.
 * Information about the currently selected policy can be found in the last ReportsSplitNavigator.
 * After user changes the policy while on Inbox, a new ReportsSplitNavigator with the changed policy has to be pushed to the navigation state.
 */
function handleSwitchPolicyIDAction(
    state: StackNavigationState<ParamListBase>,
    action: SwitchPolicyIdActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
    const lastRoute = state.routes.at(-1);
    if (lastRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        const newAction = StackActions.push(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {policyID: action.payload.policyID});

        setActiveWorkspaceID(action.payload.policyID);
        return stackRouter.getStateForAction(state, newAction, configOptions);
    }

    // We don't have other navigators that should handle switch policy action.
    return null;
}

function handlePushAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const stateWithNavigator = stackRouter.getStateForAction(state, action, configOptions);
    const navigatorName = action.payload.name;

    if (!stateWithNavigator) {
        Log.hmmm(`[handlePushAction] ${navigatorName} has not been found in the navigation state.`);
        return null;
    }

    const lastFullScreenRoute = stateWithNavigator.routes.at(-1);
    const actionPayloadScreen = action.payload?.params && 'screen' in action.payload.params ? (action.payload?.params?.screen as string) : undefined;

    if (lastFullScreenRoute?.key && navigatorName in SPLIT_TO_CONDITION && SPLIT_TO_CONDITION[navigatorName as keyof typeof SPLIT_TO_CONDITION](actionPayloadScreen)) {
        screensWithEnteringAnimation.add(lastFullScreenRoute.key);
    }

    return stateWithNavigator;
}

function handleReplaceReportsSplitNavigatorAction(
    state: StackNavigationState<ParamListBase>,
    action: ReplaceActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const stateWithReportsSplitNavigator = stackRouter.getStateForAction(state, action, configOptions);

    if (!stateWithReportsSplitNavigator) {
        Log.hmmm('[handleReplaceReportsSplitNavigatorAction] ReportsSplitNavigator has not been found in the navigation state.');
        return null;
    }

    const lastReportsSplitNavigator = stateWithReportsSplitNavigator.routes.at(-1);

    // ReportScreen should always be opened with an animation when replacing the navigator
    if (lastReportsSplitNavigator?.key) {
        screensWithEnteringAnimation.add(lastReportsSplitNavigator.key);
    }

    return stateWithReportsSplitNavigator;
}

/**
 * Handles the DISMISS_MODAL action.
 * If the last route is a modal route, it has to be popped from the navigation stack.
 */
function handleDismissModalAction(
    state: StackNavigationState<ParamListBase>,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const lastRoute = state.routes.at(-1);
    const newAction = StackActions.pop();

    if (!lastRoute?.name || !MODAL_ROUTES_TO_DISMISS.includes(lastRoute?.name)) {
        Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        return null;
    }

    return stackRouter.getStateForAction(state, newAction, configOptions);
}

/**
 * Handles opening a new modal navigator from an existing one.
 */
function handleNavigatingToModalFromModal(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const modifiedState = {...state, routes: state.routes.slice(0, -1), index: state.index !== 0 ? state.index - 1 : 0};
    return stackRouter.getStateForAction(modifiedState, action, configOptions);
}

export {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handleOpenWorkspaceSplitAction,
    handlePushAction,
    screensWithEnteringAnimation,
    handleReplaceReportsSplitNavigatorAction,
    handleSwitchPolicyIDAction,
    handleSwitchPolicyIDFromSearchAction,
    workspaceSplitsWithoutEnteringAnimation,
};
