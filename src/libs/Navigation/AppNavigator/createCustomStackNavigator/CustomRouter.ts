import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {findFocusedRoute, getPathFromState, StackRouter} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import * as Localize from '@libs/Localize';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import linkingConfig from '@libs/Navigation/linkingConfig';
import getAdaptedStateFromPath from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import type {NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import {isCentralPaneName, isOnboardingFlowName} from '@libs/NavigationUtils';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {ResponsiveStackNavigatorRouterOptions} from './types';

function insertRootRoute(state: State<RootStackParamList>, routeToInsert: NavigationPartialRoute) {
    const nonModalRoutes = state.routes.filter(
        (route) => route.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR && route.name !== NAVIGATORS.LEFT_MODAL_NAVIGATOR && route.name !== NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    );
    const modalRoutes = state.routes.filter(
        (route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || route.name === NAVIGATORS.LEFT_MODAL_NAVIGATOR || route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    );

    // It's safe to modify this state before returning in getRehydratedState.

    // @ts-expect-error Updating read only property
    // noinspection JSConstantReassignment
    state.routes = [...nonModalRoutes, routeToInsert, ...modalRoutes]; // eslint-disable-line

    // @ts-expect-error Updating read only property
    // noinspection JSConstantReassignment
    state.index = state.routes.length - 1; // eslint-disable-line

    // @ts-expect-error Updating read only property
    // noinspection JSConstantReassignment
    state.stale = true; // eslint-disable-line
}

function compareAndAdaptState(state: StackNavigationState<RootStackParamList>) {
    // If the state of the last path is not defined the getPathFromState won't work correctly.
    if (!state?.routes.at(-1)?.state) {
        return;
    }

    // We need to be sure that the bottom tab state is defined.
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);
    const isNarrowLayout = getIsNarrowLayout();

    // This solutions is heuristics and will work for our cases. We may need to improve it in the future if we will have more cases to handle.
    if (topmostBottomTabRoute && !isNarrowLayout) {
        const fullScreenRoute = state.routes.find((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR);

        // If there is fullScreenRoute we don't need to add anything.
        if (fullScreenRoute) {
            return;
        }

        // We will generate a template state and compare the current state with it.
        // If there is a difference in the screens that should be visible under the overlay, we will add the screen from templateState to the current state.
        const pathFromCurrentState = getPathFromState(state, linkingConfig.config);
        const {adaptedState: templateState} = getAdaptedStateFromPath(pathFromCurrentState, linkingConfig.config);

        if (!templateState) {
            return;
        }

        const templateFullScreenRoute = templateState.routes.find((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR);

        // If templateFullScreenRoute is defined, and full screen route is not in the state, we need to add it.
        if (templateFullScreenRoute) {
            insertRootRoute(state, templateFullScreenRoute);
            return;
        }

        const topmostCentralPaneRoute = state.routes.filter((route) => isCentralPaneName(route.name)).at(-1);
        const templateCentralPaneRoute = templateState.routes.find((route) => isCentralPaneName(route.name));

        const topmostCentralPaneRouteExtracted = getTopmostCentralPaneRoute(state);
        const templateCentralPaneRouteExtracted = getTopmostCentralPaneRoute(templateState as State<RootStackParamList>);

        // If there is no templateCentralPaneRoute, we don't have anything to add.
        if (!templateCentralPaneRoute) {
            return;
        }

        // If there is no topmostCentralPaneRoute in the state and template state has one, we need to add it.
        if (!topmostCentralPaneRoute) {
            insertRootRoute(state, templateCentralPaneRoute);
            return;
        }

        // If there is central pane route in state and template state has one, we need to check if they are the same.
        if (topmostCentralPaneRouteExtracted && templateCentralPaneRouteExtracted && topmostCentralPaneRouteExtracted.name !== templateCentralPaneRouteExtracted.name) {
            // Not every RHP screen has matching central pane defined. In that case we use the REPORT screen as default for initial screen.
            // But we don't want to override the central pane for those screens as they may be opened with different central panes under the overlay.
            // e.g. i-know-a-teacher may be opened with different central panes under the overlay
            if (templateCentralPaneRouteExtracted.name === SCREENS.REPORT) {
                return;
            }
            insertRootRoute(state, templateCentralPaneRoute);
        }
    }
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
        // We reset the URL as the browser sets it in a way that doesn't match the navigation state
        // eslint-disable-next-line no-restricted-globals
        history.replaceState({}, '', getPathFromState(state, linkingConfig.config));
        return true;
    }
}

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getRehydratedState(partialState: StackNavigationState<RootStackParamList>, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            compareAndAdaptState(partialState);
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType, configOptions: RouterConfigOptions) {
            if (shouldPreventReset(state, action)) {
                return state;
            }
            return stackRouter.getStateForAction(state, action, configOptions);
        },
    };
}

export default CustomRouter;
