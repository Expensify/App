import {CommonActions, StackRouter} from '@react-navigation/native';
import type {RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import {createGuardContext, evaluateGuards} from '@libs/Navigation/guards';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handleOpenDomainSplitAction,
    handleOpenWorkspaceSplitAction,
    handlePushFullscreenAction,
    handleReplaceReportsSplitNavigatorAction,
    handleToggleSidePanelWithHistoryAction,
} from './GetStateForActionHandlers';
import syncBrowserHistory from './syncBrowserHistory';
import type {
    DismissModalActionType,
    OpenDomainSplitActionType,
    OpenWorkspaceSplitActionType,
    PreloadActionType,
    PushActionType,
    ReplaceActionType,
    RootStackNavigatorAction,
    RootStackNavigatorRouterOptions,
    ToggleSidePanelWithHistoryActionType,
} from './types';

function isOpenWorkspaceSplitAction(action: RootStackNavigatorAction): action is OpenWorkspaceSplitActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
}

function isOpenDomainSplitAction(action: RootStackNavigatorAction): action is OpenDomainSplitActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.OPEN_DOMAIN_SPLIT;
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

function isToggleSidePanelWithHistoryAction(action: RootStackNavigatorAction): action is ToggleSidePanelWithHistoryActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
}

function isPreloadAction(action: RootStackNavigatorAction): action is PreloadActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PRELOAD;
}

/**
 * Evaluates navigation guards and handles BLOCK/REDIRECT results
 *
 * @param state - Current navigation state
 * @param action - Navigation action being attempted
 * @param configOptions - Router configuration options
 * @param stackRouter - Stack router instance
 * @returns Modified state if guard blocks/redirects, null if navigation should proceed
 */
function handleNavigationGuards(
    state: StackNavigationState<ParamListBase>,
    action: RootStackNavigatorAction,
    configOptions: RouterConfigOptions,
    stackRouter: ReturnType<typeof StackRouter>,
): ReturnType<ReturnType<typeof StackRouter>['getStateForAction']> | null {
    const guardContext = createGuardContext();
    const guardResult = evaluateGuards(state, action, guardContext);

    if (guardResult.type === 'BLOCK') {
        syncBrowserHistory(state);
        return state;
    }

    if (guardResult.type === 'REDIRECT') {
        const redirectState = getAdaptedStateFromPath(guardResult.route, linkingConfig.config);

        if (!redirectState || !redirectState.routes) {
            return null;
        }

        const resetAction = CommonActions.reset({
            index: redirectState.index ?? redirectState.routes.length - 1,
            routes: redirectState.routes,
        });

        return stackRouter.getStateForAction(state, resetAction, configOptions);
    }

    return null;
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

    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: RootStackNavigatorAction, configOptions: RouterConfigOptions) {
            // Evaluate navigation guards FIRST
            const guardState = handleNavigationGuards(state, action, configOptions, stackRouter);
            if (guardState) {
                return guardState;
            }

            // Guards allowed navigation - continue with routing logic

            if (isPreloadAction(action) && action.payload.name === state.routes.at(-1)?.name) {
                return state;
            }

            if (isToggleSidePanelWithHistoryAction(action)) {
                return handleToggleSidePanelWithHistoryAction(state, action);
            }

            if (isOpenWorkspaceSplitAction(action)) {
                return handleOpenWorkspaceSplitAction(state, action, configOptions, stackRouter);
            }

            if (isOpenDomainSplitAction(action)) {
                return handleOpenDomainSplitAction(state, action, configOptions, stackRouter);
            }

            if (isDismissModalAction(action)) {
                return handleDismissModalAction(state, configOptions, stackRouter);
            }

            if (isReplaceAction(action) && action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                return handleReplaceReportsSplitNavigatorAction(state, action, configOptions, stackRouter);
            }

            // When navigating to a specific workspace from WorkspaceListPage there should be entering animation for its sidebar (only case where we want animation for sidebar)
            // That's why we have a separate handler for opening it called handleOpenWorkspaceSplitAction
            // options for WorkspaceSplitNavigator can be found in AuthScreens.tsx > getWorkspaceSplitNavigatorOptions
            if (isPushAction(action) && isFullScreenName(action.payload.name) && action.payload.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                return handlePushFullscreenAction(state, action, configOptions, stackRouter);
            }

            if (isNavigatingToModalFromModal(state, action)) {
                return handleNavigatingToModalFromModal(state, action, configOptions, stackRouter);
            }

            return stackRouter.getStateForAction(state, action, configOptions);
        },
    };
}

export default RootStackRouter;
