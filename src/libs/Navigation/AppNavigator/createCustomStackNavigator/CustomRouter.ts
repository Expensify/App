import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {findFocusedRoute, StackRouter} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import * as Localize from '@libs/Localize';
import isSideModalNavigator from '@libs/Navigation/isSideModalNavigator';
import {isOnboardingFlowName} from '@libs/NavigationUtils';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import * as GetStateForActionHandlers from './GetStateForActionHandlers';
import syncBrowserHistory from './syncBrowserHistory';
import type {
    CustomRouterActionType,
    CustomRouterAction,
    DismissModalActionType,
    PushActionType,
    SwitchPolicyIdActionType,
    ResponsiveStackNavigatorRouterOptions,
} from './types';

function isSwitchPolicyIdAction(action: CustomRouterAction): action is SwitchPolicyIdActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
}

function isPushAction(action: CustomRouterAction): action is PushActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH;
}

function isDismissModalAction(action: CustomRouterAction): action is DismissModalActionType {
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

function shouldDismissSideModalNavigator(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType) {
    if (action.type !== CONST.NAVIGATION.ACTION_TYPE.PUSH) {
        return false;
    }

    const lastRoute = state.routes.at(-1);

    // If the last route is a side modal navigator and the generated minimal action want's to push a new side modal navigator that means they are different ones.
    // We want to dismiss the one that is currently on the top.
    if (isSideModalNavigator(lastRoute?.name) && isSideModalNavigator(action.payload.name)) {
        return true;
    }
    return false;
}

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);
    const {setActiveWorkspaceID} = useActiveWorkspace();

    // @TODO: Make sure that everything works fine without compareAndAdaptState function. Probably with getMatchingFullScreenRoute.
    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CustomRouterAction, configOptions: RouterConfigOptions) {
            if (isSwitchPolicyIdAction(action)) {
                return GetStateForActionHandlers.handleSwitchPolicyID(state, action, configOptions, stackRouter, setActiveWorkspaceID);
            }

            if (isDismissModalAction(action)) {
                return GetStateForActionHandlers.handleDismissModalAction(state, action, configOptions, stackRouter);
            }

            if (isPushAction(action)) {
                if (action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                    return GetStateForActionHandlers.handlePushReportAction(state, action, configOptions, stackRouter, setActiveWorkspaceID);
                }

                if (action.payload.name === SCREENS.SEARCH.CENTRAL_PANE) {
                    return GetStateForActionHandlers.handlePushSearchPageAction(state, action, configOptions, stackRouter, setActiveWorkspaceID);
                }
            }

            // Don't let the user navigate back to a non-onboarding screen if they are currently on an onboarding screen and it's not finished.
            if (shouldPreventReset(state, action)) {
                syncBrowserHistory(state);
                return state;
            }

            if (shouldDismissSideModalNavigator(state, action)) {
                const modifiedState = {...state, routes: state.routes.slice(0, -1), index: state.index !== 0 ? state.index - 1 : 0};
                return stackRouter.getStateForAction(modifiedState, action, configOptions);
            }

            return stackRouter.getStateForAction(state, action, configOptions);
        },
    };
}

export default CustomRouter;
export type {CustomRouterActionType};
