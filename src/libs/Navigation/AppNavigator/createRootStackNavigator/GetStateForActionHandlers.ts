import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import SCREENS_WITH_NAVIGATION_TAB_BAR from '@components/Navigation/TopLevelNavigationTabBar/SCREENS_WITH_NAVIGATION_TAB_BAR';
import Log from '@libs/Log';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {OpenWorkspaceSplitActionType, PushActionType, ReplaceActionType} from './types';

const MODAL_ROUTES_TO_DISMISS: string[] = [
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
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
    const actionToPushWorkspacesList = StackActions.push(SCREENS.WORKSPACES_LIST);

    const stateWithWorkspacesList = stackRouter.getStateForAction(state, actionToPushWorkspacesList, configOptions);

    if (!stateWithWorkspacesList) {
        Log.hmmm('[handleOpenWorkspaceSplitAction] WorkspacesList has not been found in the navigation state.');
        return null;
    }

    const actionToPushWorkspaceSplitNavigator = StackActions.push(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {
            policyID: action.payload.policyID,
        },
    });

    const rehydratedStateWithWorkspacesList = stackRouter.getRehydratedState(stateWithWorkspacesList, configOptions);
    const stateWithWorkspaceSplitNavigator = stackRouter.getStateForAction(rehydratedStateWithWorkspacesList, actionToPushWorkspaceSplitNavigator, configOptions);

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

function handlePushFullscreenAction(
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

    // Transitioning to all central screens in each split should be animated
    if (lastFullScreenRoute?.key && actionPayloadScreen && !SCREENS_WITH_NAVIGATION_TAB_BAR.includes(actionPayloadScreen)) {
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
    handlePushFullscreenAction,
    handleReplaceReportsSplitNavigatorAction,
    screensWithEnteringAnimation,
    workspaceSplitsWithoutEnteringAnimation,
};
