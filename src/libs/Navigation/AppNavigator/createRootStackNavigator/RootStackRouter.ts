import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {findFocusedRoute, StackRouter} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import {updateLastAccessedWorkspaceSwitcher} from '@libs/actions/Policy/Policy';
import * as Localize from '@libs/Localize';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handleOpenWorkspaceSplitAction,
    handlePushReportSplitAction,
    handlePushSearchPageAction,
    handleReplaceReportsSplitNavigatorAction,
    handleSwitchPolicyIDAction,
} from './GetStateForActionHandlers';
import syncBrowserHistory from './syncBrowserHistory';
import type {
    DismissModalActionType,
    OpenWorkspaceSplitActionType,
    PushActionType,
    ReplaceActionType,
    RootStackNavigatorAction,
    RootStackNavigatorRouterOptions,
    SwitchPolicyIdActionType,
} from './types';

function isOpenWorkspaceSplitAction(action: RootStackNavigatorAction): action is OpenWorkspaceSplitActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
}

function isSwitchPolicyIdAction(action: RootStackNavigatorAction): action is SwitchPolicyIdActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
}

function isPushAction(action: RootStackNavigatorAction): action is PushActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH;
}

function isReplaceAction(action: RootStackNavigatorAction): action is ReplaceActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REPLACE;
}

function isDismissModalAction(action: RootStackNavigatorAction): action is DismissModalActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
}

function shouldPreventReset(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType) {
    if (action.type !== CONST.NAVIGATION_ACTIONS.RESET || !action?.payload) {
        return false;
    }
    const currentFocusedRoute = findFocusedRoute(state);
    const targetFocusedRoute = findFocusedRoute(action?.payload);

    // We want to prevent the user from navigating back to a non-onboarding screen if they are currently on an onboarding screen
    if (isOnboardingFlowName(currentFocusedRoute?.name) && !isOnboardingFlowName(targetFocusedRoute?.name)) {
        Welcome.setOnboardingErrorMessage(Localize.translateLocal('onboarding.purpose.errorBackButton'));
        return true;
    }

    return false;
}

function isNavigatingToModalFromModal(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType): action is PushActionType {
    if (action.type !== CONST.NAVIGATION.ACTION_TYPE.PUSH) {
        return false;
    }

    const lastRoute = state.routes.at(-1);

    // If the last route is a side modal navigator and the generated minimal action want's to push a new side modal navigator that means they are different ones.
    // We want to dismiss the one that is currently on the top.
    return isSideModalNavigator(lastRoute?.name) && isSideModalNavigator(action.payload.name);
}

function RootStackRouter(options: RootStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);
    const {setActiveWorkspaceID: setActiveWorkspaceIDUtils} = useActiveWorkspace();
    const setActiveWorkspaceID = (workspaceID: string | undefined) => {
        setActiveWorkspaceIDUtils?.(workspaceID);
        updateLastAccessedWorkspaceSwitcher(workspaceID);
    };

    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: RootStackNavigatorAction, configOptions: RouterConfigOptions) {
            if (isOpenWorkspaceSplitAction(action)) {
                return handleOpenWorkspaceSplitAction(state, action, configOptions, stackRouter);
            }

            if (isSwitchPolicyIdAction(action)) {
                return handleSwitchPolicyIDAction(state, action, configOptions, stackRouter, setActiveWorkspaceID);
            }

            if (isDismissModalAction(action)) {
                return handleDismissModalAction(state, configOptions, stackRouter);
            }

            if (isReplaceAction(action) && action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                return handleReplaceReportsSplitNavigatorAction(state, action, configOptions, stackRouter);
            }

            if (isPushAction(action)) {
                if (action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                    return handlePushReportSplitAction(state, action, configOptions, stackRouter, setActiveWorkspaceID);
                }

                if (action.payload.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
                    return handlePushSearchPageAction(state, action, configOptions, stackRouter, setActiveWorkspaceID);
                }
            }

            // Don't let the user navigate back to a non-onboarding screen if they are currently on an onboarding screen and it's not finished.
            if (shouldPreventReset(state, action)) {
                syncBrowserHistory(state);
                return state;
            }

            if (isNavigatingToModalFromModal(state, action)) {
                return handleNavigatingToModalFromModal(state, action, configOptions, stackRouter);
            }

            return stackRouter.getStateForAction(state, action, configOptions);
        },
    };
}

export default RootStackRouter;
