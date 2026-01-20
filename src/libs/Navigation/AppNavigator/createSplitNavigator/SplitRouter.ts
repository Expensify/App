import type {CommonActions, ParamListBase, PartialState, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions, StackRouter} from '@react-navigation/native';
import pick from 'lodash/pick';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import getParamsFromRoute from '@libs/Navigation/helpers/getParamsFromRoute';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationPartialRoute} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type SplitNavigatorRouterOptions from './types';
import {getPreservedNavigatorState} from './usePreserveNavigatorState';

type StackState = StackNavigationState<ParamListBase> | PartialState<StackNavigationState<ParamListBase>>;

const isAtLeastOneInState = (state: StackState, screenName: string): boolean => state.routes.some((route) => route.name === screenName);

type AdaptStateIfNecessaryArgs = {
    state: StackState;
    options: SplitNavigatorRouterOptions;
};

/**
 * Adapts the navigation state of a SplitNavigator to ensure proper screen layout and navigation flow.
 * This function handles both narrow and wide layouts, ensuring that:
 * 1. On narrow layout, it manages sidebar visibility appropriately
 * 2. On wide layout, it ensures both sidebar and central screens are present
 * 3. Handles policy-specific navigation states
 *
 * For detailed information about SplitNavigator state adaptation and navigation patterns,
 * see the NAVIGATION.md documentation.
 *
 * @param state - The current navigation state to adapt
 * @param options - Configuration options including sidebarScreen, defaultCentralScreen, and parentRoute
 */
function adaptStateIfNecessary({state, options: {sidebarScreen, defaultCentralScreen, parentRoute}}: AdaptStateIfNecessaryArgs) {
    if (!navigationRef.isReady()) {
        Log.warn('[src/libs/Navigation/AppNavigator/createSplitNavigator/SplitRouter.ts] NavigationRef is not ready. Returning the original state without adaptation.');
    }

    const isNarrowLayout = getIsNarrowLayout();
    const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
    const lastRoute = state.routes.at(-1) as NavigationPartialRoute;

    const routes = [...state.routes];
    let modified = false;

    // When initializing the app on a small screen with the center screen as the initial screen, the sidebar must also be split to allow users to swipe back.
    const isInitialRoute = !rootState || rootState.routes.length === 1;
    const shouldSplitHaveSidebar = isInitialRoute || !isNarrowLayout;

    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isAtLeastOneInState(state, sidebarScreen) && shouldSplitHaveSidebar) {
        const paramsFromRoute = getParamsFromRoute(sidebarScreen, !isNarrowLayout);
        const copiedParams = pick(lastRoute?.params, paramsFromRoute);

        // We don't want to get an empty object as params because it breaks some navigation logic when comparing if routes are the same.
        const params = isEmptyObject(copiedParams) ? undefined : copiedParams;

        routes.unshift({
            name: sidebarScreen,
            // This handles the case where the sidebar should have params included in the central screen e.g. policyID for workspace initial.
            params,
        });
        modified = true;
    }

    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isNarrowLayout) {
        if (routes.length === 1 && routes.at(0)?.name === sidebarScreen) {
            const previousSameNavigator = rootState?.routes.filter((route) => route.name === parentRoute.name).at(-2);

            // If we have optimization for not rendering all split navigators, then last selected option may not be in the state. In this case state has to be read from the preserved state.
            const previousSameNavigatorState = previousSameNavigator?.state ?? (previousSameNavigator?.key ? getPreservedNavigatorState(previousSameNavigator.key) : undefined);
            const previousSelectedCentralScreen =
                previousSameNavigatorState?.routes && previousSameNavigatorState.routes.length > 1 ? previousSameNavigatorState.routes.at(-1)?.name : undefined;

            routes.push({
                name: previousSelectedCentralScreen ?? defaultCentralScreen,
                params: state.routes.at(0)?.params,
            });
            modified = true;
        }
    }

    if (!modified) {
        return state;
    }

    return {
        ...state,
        routes,
        stale: true,
        index: routes.length - 1,
    } as StackState;
}

function isPushingSidebarOnCentralPane(state: StackState, action: CommonActions.Action | StackActionType, options: SplitNavigatorRouterOptions) {
    const isSidebarAction = (action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH || action.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) && action.payload.name === options.sidebarScreen;
    if (!isSidebarAction) {
        return false;
    }

    const sidebarExists = state.routes.some((route) => route.name === options.sidebarScreen);
    return sidebarExists;
}

// If only one central screen is displayed on a wide layout and GO_BACK action is performed, we need to pop the entire navigator
function shouldPopEntireNavigator(state: StackState, action: CommonActions.Action | StackActionType) {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK && !getIsNarrowLayout() && state.routes.length === 2;
}

function SplitRouter(options: SplitNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);
    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType, configOptions: RouterConfigOptions) {
            if (isPushingSidebarOnCentralPane(state, action, options)) {
                if (getIsNarrowLayout()) {
                    const newAction = StackActions.popToTop();
                    return stackRouter.getStateForAction(state, newAction, configOptions);
                }
                // On wide screen do nothing as we want to keep the central pane screen and the sidebar is visible.
                return state;
            }

            if (shouldPopEntireNavigator(state, action)) {
                const stateAfterPop = stackRouter.getStateForAction(state, StackActions.pop(), configOptions) as StackNavigationState<ParamListBase>;
                return stackRouter.getStateForAction(stateAfterPop, StackActions.pop(), configOptions);
            }
            return stackRouter.getStateForAction(state, action, configOptions);
        },

        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const initialState = getPreservedNavigatorState(options.parentRoute.key) ?? stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
            const maybeAdaptedState = adaptStateIfNecessary({state: initialState, options});

            // If we needed to modify the state we need to rehydrate it to get keys for new routes.
            if (maybeAdaptedState.stale) {
                return stackRouter.getRehydratedState(maybeAdaptedState, {routeNames, routeParamList, routeGetIdList});
            }

            return maybeAdaptedState as StackNavigationState<ParamListBase>;
        },

        getRehydratedState(partialState: StackState, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            const adaptedState = adaptStateIfNecessary({state: partialState, options});
            return stackRouter.getRehydratedState(adaptedState, {routeNames, routeParamList, routeGetIdList});
        },
    };
}

export default SplitRouter;
