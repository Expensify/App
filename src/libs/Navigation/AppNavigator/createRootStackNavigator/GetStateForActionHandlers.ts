import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import SCREENS_WITH_NAVIGATION_TAB_BAR from '@components/Navigation/TopLevelNavigationTabBar/SCREENS_WITH_NAVIGATION_TAB_BAR';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {isSplitNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {OpenDomainSplitActionType, OpenWorkspaceSplitActionType, PushActionType, ReplaceActionType, ToggleSidePanelWithHistoryActionType} from './types';

const MODAL_ROUTES_TO_DISMISS = new Set<string>([
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR,
    NAVIGATORS.SHARE_MODAL_NAVIGATOR,
    NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR,
    SCREENS.NOT_FOUND,
    SCREENS.REPORT_ATTACHMENTS,
    SCREENS.REPORT_ADD_ATTACHMENT,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW,
    SCREENS.PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.REPORT_AVATAR,
    SCREENS.CONCIERGE,
]);

const workspaceOrDomainSplitsWithoutEnteringAnimation = new Set<string>();

const screensWithEnteringAnimation = new Set<string>();

/**
 * Util function with common logic for handling OPEN_WORKSPACE_SPLIT and OPEN_DOMAIN_SPLIT actions.
 *
 * Pushes the workspace hub split navigator first and then pushes the split navigator.
 * This allows the user to swipe back on the iOS to the workspace hub split navigator underneath.
 */
function prepareStateUnderWorkspaceOrDomainNavigator(
    state: StackNavigationState<ParamListBase>,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    actionToPushWorkspaceSplitNavigator: StackActionType,
    splitNavigatorName: typeof NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR | typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
) {
    const actionToPushWorkspacesList = StackActions.push(SCREENS.WORKSPACES_LIST);

    const stateWithWorkspacesList = stackRouter.getStateForAction(state, actionToPushWorkspacesList, configOptions);

    if (!stateWithWorkspacesList) {
        Log.hmmm('[handleOpenWorkspaceOrDomainSplitAction] WorkspacesList has not been found in the navigation state.');
        return null;
    }

    const rehydratedStateWithWorkspacesList = stackRouter.getRehydratedState(stateWithWorkspacesList, configOptions);
    const stateWithSplitNavigator = stackRouter.getStateForAction(rehydratedStateWithWorkspacesList, actionToPushWorkspaceSplitNavigator, configOptions);

    if (!stateWithSplitNavigator) {
        Log.hmmm(`[handleOpenWorkspaceOrDomainSplitAction] ${splitNavigatorName} has not been found in the navigation state.`);
        return null;
    }

    const lastFullScreenRoute = stateWithSplitNavigator.routes.at(-1);

    if (lastFullScreenRoute?.key) {
        // If the user opened the workspace/domain split navigator from a different tab, we don't want to animate the entering transition.
        // To make it feel like bottom tab navigator.
        workspaceOrDomainSplitsWithoutEnteringAnimation.add(lastFullScreenRoute.key);
    }

    return stateWithSplitNavigator;
}

/**
 * Handles the OPEN_WORKSPACE_SPLIT action.
 * If the user is on other tab than workspaces and the workspace split is "remembered", this action will be called after pressing the settings tab.
 */
function handleOpenWorkspaceSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: OpenWorkspaceSplitActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const actionToPushWorkspaceSplitNavigator = StackActions.push(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {
            policyID: action.payload.policyID,
        },
    });

    return prepareStateUnderWorkspaceOrDomainNavigator(state, configOptions, stackRouter, actionToPushWorkspaceSplitNavigator, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);
}

/**
 * Handles the OPEN_DOMAIN_SPLIT action.
 * If the user is on other tab than workspaces and the domain split is "remembered", this action will be called after pressing the settings tab.
 */
function handleOpenDomainSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: OpenDomainSplitActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const actionToPushDomainSplitNavigator = StackActions.push(NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {
            domainAccountID: action.payload.domainAccountID,
        },
    });

    return prepareStateUnderWorkspaceOrDomainNavigator(state, configOptions, stackRouter, actionToPushDomainSplitNavigator, NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR);
}

function handlePushFullscreenAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const targetScreen = action.payload?.params && 'screen' in action.payload.params ? (action.payload?.params?.screen as string) : undefined;
    const navigatorName = action.payload.name;

    // If we navigate to the central screen of the split navigator, we need to filter this navigator from preloadedRoutes to remove a sidebar screen from the state
    const shouldFilterPreloadedRoutes =
        getIsNarrowLayout() &&
        isSplitNavigatorName(navigatorName) &&
        targetScreen !== SPLIT_TO_SIDEBAR[navigatorName] &&
        state.preloadedRoutes?.some((preloadedRoute) => preloadedRoute.name === navigatorName);

    const adjustedState = shouldFilterPreloadedRoutes ? {...state, preloadedRoutes: state.preloadedRoutes.filter((preloadedRoute) => preloadedRoute.name !== navigatorName)} : state;
    const stateWithNavigator = stackRouter.getStateForAction(adjustedState, action, configOptions);

    if (!stateWithNavigator) {
        Log.hmmm(`[handlePushAction] ${navigatorName} has not been found in the navigation state.`);
        return null;
    }

    const lastFullScreenRoute = stateWithNavigator.routes.at(-1);

    // Transitioning to all central screens in each split should be animated
    if (lastFullScreenRoute?.key && targetScreen && !SCREENS_WITH_NAVIGATION_TAB_BAR.includes(targetScreen)) {
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

    if (!lastRoute?.name || !MODAL_ROUTES_TO_DISMISS.has(lastRoute?.name)) {
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

function handleToggleSidePanelWithHistoryAction(state: StackNavigationState<ParamListBase>, action: ToggleSidePanelWithHistoryActionType) {
    // This shouldn't ever happen as the history should be always defined. It's for type safety.
    if (!state?.history) {
        return state;
    }

    // If it's set to true, we need to add the side panel history entry if it's not already there.
    if (action.payload.isVisible && state.history.at(-1) !== CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL) {
        return {...state, history: [...state.history, CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL]};
    }

    // If it's set to false, we need to remove the side panel history entry if it's there.
    if (!action.payload.isVisible) {
        return {...state, history: state.history.filter((entry) => entry !== CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL)};
    }

    // Else, do not change history.
    return state;
}

export {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handleOpenWorkspaceSplitAction,
    handleOpenDomainSplitAction,
    handlePushFullscreenAction,
    handleReplaceReportsSplitNavigatorAction,
    screensWithEnteringAnimation,
    workspaceOrDomainSplitsWithoutEnteringAnimation,
    handleToggleSidePanelWithHistoryAction,
};
