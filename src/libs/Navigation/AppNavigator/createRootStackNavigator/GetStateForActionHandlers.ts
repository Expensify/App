import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import Log from '@libs/Log';
import getPolicyIDFromState from '@libs/Navigation/helpers/getPolicyIDFromState';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {OpenWorkspaceSplitActionType, PushActionType, SwitchPolicyIdActionType} from './types';

const MODAL_ROUTES_TO_DISMISS: string[] = [
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS.LEFT_MODAL_NAVIGATOR,
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR,
    SCREENS.NOT_FOUND,
    SCREENS.ATTACHMENTS,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.REPORT_AVATAR,
    SCREENS.CONCIERGE,
];

const workspaceSplitsWithoutEnteringAnimation = new Set();
const reportsSplitsWithEnteringAnimation = new Set();

/**
 * Handles the OPEN_WORKSPACE_SPLIT action.
 * If the user is on other tab than settings and the workspace split is "remembered", this action will be called after pressing the settings tab.
 * It will push the settings split navigator first and then push the workspace split navigator.
 * This allows the user to swipe back on the iOS to the settings split navigator underneath.
 */
function handleOpenWorkspaceSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: OpenWorkspaceSplitActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const actionToPushSettingsSplitNavigator = StackActions.push(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, {
        screen: SCREENS.SETTINGS.WORKSPACES,
    });

    const actionToPushWorkspaceSplitNavigator = StackActions.push(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: SCREENS.WORKSPACE.INITIAL,
        params: {
            policyID: action.payload.policyID,
        },
    });

    const stateWithSettingsSplitNavigator = stackRouter.getStateForAction(state, actionToPushSettingsSplitNavigator, configOptions);

    if (!stateWithSettingsSplitNavigator) {
        Log.hmmm('[handleOpenWorkspaceSplitAction] SettingsSplitNavigator has not been found in the navigation state.');
        return null;
    }

    const rehydratedStateWithSettingsSplitNavigator = stackRouter.getRehydratedState(stateWithSettingsSplitNavigator, configOptions);
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
 * Handles the SWITCH_POLICY_ID action.
 * Information about the currently selected policy can be found in the last ReportsSplitNavigator or Search_Root.
 * As the policy can only be changed from Search or Inbox Tab, after changing the policy a new ReportsSplitNavigator or Search_Root with the changed policy has to be pushed to the navigation state.
 */
function handleSwitchPolicyID(
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
    if (lastRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        const newAction = StackActions.push(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {policyID: action.payload.policyID});

        setActiveWorkspaceID(action.payload.policyID);
        return stackRouter.getStateForAction(state, newAction, configOptions);
    }

    // We don't have other navigators that should handle switch policy action.
    return null;
}

/**
 * If a new ReportSplitNavigator is opened, it is necessary to check whether workspace is currently selected in the application.
 * If so, the id of the current policy has to be passed to the new ReportSplitNavigator.
 */
function handlePushReportSplitAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
    const haveParamsPolicyID = action.payload.params && 'policyID' in action.payload.params;
    let policyID;

    if (haveParamsPolicyID) {
        policyID = (action.payload.params as Record<string, string | undefined>)?.policyID;
        setActiveWorkspaceID(policyID);
    } else {
        policyID = getPolicyIDFromState(state as State<RootNavigatorParamList>);
    }

    const modifiedAction = {
        ...action,
        payload: {
            ...action.payload,
            params: {
                ...action.payload.params,
                policyID,
            },
        },
    };

    const stateWithReportsSplitNavigator = stackRouter.getStateForAction(state, modifiedAction, configOptions);

    if (!stateWithReportsSplitNavigator) {
        Log.hmmm('[handlePushReportAction] ReportsSplitNavigator has not been found in the navigation state.');
        return null;
    }

    const lastFullScreenRoute = stateWithReportsSplitNavigator.routes.at(-1);
    const actionPayloadScreen = action.payload?.params && 'screen' in action.payload.params ? action.payload?.params?.screen : undefined;

    // ReportScreen should always be opened with an animation
    if (actionPayloadScreen === SCREENS.REPORT && lastFullScreenRoute?.key) {
        reportsSplitsWithEnteringAnimation.add(lastFullScreenRoute.key);
    }

    return stateWithReportsSplitNavigator;
}

/**
 * If a new Search page is opened, it is necessary to check whether workspace is currently selected in the application.
 * If so, the id of the current policy has to be passed to the new Search page
 */
function handlePushSearchPageAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
    const currentParams = action.payload.params as RootNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
    const queryJSON = SearchQueryUtils.buildSearchQueryJSON(currentParams.q);

    if (!queryJSON) {
        return null;
    }

    if (!queryJSON.policyID) {
        const policyID = getPolicyIDFromState(state as State<RootNavigatorParamList>);

        if (policyID) {
            queryJSON.policyID = policyID;
        } else {
            delete queryJSON.policyID;
        }
    } else {
        setActiveWorkspaceID(queryJSON.policyID);
    }

    const modifiedAction = {
        ...action,
        payload: {
            ...action.payload,
            params: {
                ...action.payload.params,
                q: SearchQueryUtils.buildSearchQueryString(queryJSON),
            },
        },
    };

    return stackRouter.getStateForAction(state, modifiedAction, configOptions);
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
    handleOpenWorkspaceSplitAction,
    handleDismissModalAction,
    handlePushReportSplitAction,
    handlePushSearchPageAction,
    handleSwitchPolicyID,
    handleNavigatingToModalFromModal,
    workspaceSplitsWithoutEnteringAnimation,
    reportsSplitsWithEnteringAnimation,
};
