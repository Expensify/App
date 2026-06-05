import {CommonActions, StackRouter} from '@react-navigation/native';
import type {NavigationState, PartialState, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import {createGuardContext, evaluateGuards} from '@libs/Navigation/guards';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import {getTabScreenParam} from '@libs/Navigation/helpers/tabNavigatorUtils';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import {
    handleDismissModalAction,
    handleNavigatingToModalFromModal,
    handleOpenDomainSplitAction,
    handleOpenWorkspaceSplitAction,
    handlePushFullscreenAction,
    handleRemoveFullscreenUnderRHP,
    handleReplaceFullscreenUnderRHP,
    handleReplaceReportsSplitNavigatorAction,
    handleToggleMfaModalNavigatorWithHistoryAction,
    handleToggleSidePanelWithHistoryAction,
    MODAL_ROUTES_TO_DISMISS,
} from './GetStateForActionHandlers';
import syncBrowserHistory from './syncBrowserHistory';
import type {
    DismissModalActionType,
    OpenDomainSplitActionType,
    OpenWorkspaceSplitActionType,
    PreloadActionType,
    PushActionType,
    RemoveFullscreenUnderRHPActionType,
    ReplaceActionType,
    ReplaceFullscreenUnderRHPActionType,
    RootStackNavigatorAction,
    RootStackNavigatorRouterOptions,
    ToggleMfaModalNavigatorWithHistoryActionType,
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

function isReplaceFullscreenUnderRHPAction(action: RootStackNavigatorAction): action is ReplaceFullscreenUnderRHPActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP;
}

function isRemoveFullscreenUnderRHPAction(action: RootStackNavigatorAction): action is RemoveFullscreenUnderRHPActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP;
}

function isToggleSidePanelWithHistoryAction(action: RootStackNavigatorAction): action is ToggleSidePanelWithHistoryActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.TOGGLE_SIDE_PANEL_WITH_HISTORY;
}

function isToggleMfaModalNavigatorWithHistoryAction(action: RootStackNavigatorAction): action is ToggleMfaModalNavigatorWithHistoryActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY;
}

function isPreloadAction(action: RootStackNavigatorAction): action is PreloadActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PRELOAD;
}

// Onboarding REDIRECT layers a modal on top of whatever was already on screen.
// Preserve the underlying fullscreen base rather than replacing the entire stack.
const MODAL_GUARD_REDIRECT_TARGETS = new Set<string>([NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]);

function isModalGuardRedirectTarget(name: string | undefined): boolean {
    return !!name && MODAL_GUARD_REDIRECT_TARGETS.has(name);
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

        if (!redirectState?.routes) {
            return null;
        }

        const isModalRedirect = redirectState.routes.some((r) => isModalGuardRedirectTarget(r.name));
        const focusedRouteName = state.routes[state.index]?.name;
        const redirectTargetName = redirectState.routes.at(-1)?.name;

        // Idempotency guard against APP-7FR-style loops when multiple actions burst at cold-start.
        // This is intentionally scoped to modal redirects so non-modal redirects like HOME can still
        // reset nested state even when their root navigator is already focused.
        if (isModalRedirect && focusedRouteName && redirectTargetName && focusedRouteName === redirectTargetName) {
            return state;
        }

        if (isModalRedirect) {
            // Drop dismissible-modal routes (RHP, SignIn modal, CONCIERGE, etc.) and anything
            // above them so the new stack doesn't end up with two modals on top of
            // each other - regression #86258 (two Expensify logos when SignIn RHP was still
            // on top at REDIRECT time).
            const firstDismissibleModalIndex = state.routes.findIndex((route) => MODAL_ROUTES_TO_DISMISS.has(route.name));
            const cleanedRoutes = firstDismissibleModalIndex === -1 ? state.routes : state.routes.slice(0, firstDismissibleModalIndex);

            const underlyingFullScreen = cleanedRoutes.findLast((r) => isFullScreenName(r.name));
            const redirectModal = redirectState.routes.findLast((r) => isModalGuardRedirectTarget(r.name));

            // Invariant restored: exactly one fullscreen base under the modal. If no
            // fullscreen survives (e.g. `/concierge` force-close leaves the stack as [CONCIERGE]),
            // fall through to the unmodified redirectState.routes - that baseline is what
            // SignInModal.tsx and navigateAfterOnboarding's Navigation.navigate(ROUTES.HOME)
            // calls expect; removing them caused regression #90303.
            if (underlyingFullScreen && redirectModal) {
                const modalResetAction = CommonActions.reset({
                    index: 1,
                    routes: [underlyingFullScreen, redirectModal],
                } as PartialState<NavigationState>);
                return stackRouter.getStateForAction(state, modalResetAction, configOptions);
            }
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

            if (isToggleMfaModalNavigatorWithHistoryAction(action)) {
                return handleToggleMfaModalNavigatorWithHistoryAction(state, action);
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

            if (isReplaceFullscreenUnderRHPAction(action)) {
                return handleReplaceFullscreenUnderRHP(state, action, configOptions, stackRouter);
            }

            if (isRemoveFullscreenUnderRHPAction(action)) {
                return handleRemoveFullscreenUnderRHP(state, action, configOptions, stackRouter);
            }

            if (isReplaceAction(action) && (action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || getTabScreenParam(action.payload) === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)) {
                return handleReplaceReportsSplitNavigatorAction(state, action, configOptions, stackRouter);
            }

            // When navigating to a specific workspace from WorkspaceListPage there should be entering animation for its sidebar (only case where we want animation for sidebar)
            // That's why we have a separate handler for opening it called handleOpenWorkspaceSplitAction
            // options for WorkspaceSplitNavigator can be found in AuthScreens.tsx > getWorkspaceSplitNavigatorOptions
            if (isPushAction(action) && isFullScreenName(action.payload.name) && action.payload.name !== NAVIGATORS.WORKSPACE_NAVIGATOR) {
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
