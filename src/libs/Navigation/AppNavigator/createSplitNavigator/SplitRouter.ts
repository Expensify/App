import type {CommonActions, ParamListBase, PartialState, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions, StackRouter} from '@react-navigation/native';
import pick from 'lodash/pick';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getParamsFromRoute from '@libs/Navigation/helpers/getParamsFromRoute';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationPartialRoute} from '@libs/Navigation/types';
import {shouldDisplayPolicyNotFoundPage} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SplitNavigatorRouterOptions} from './types';
import {getPreservedNavigatorState} from './usePreserveNavigatorState';

type StackState = StackNavigationState<ParamListBase> | PartialState<StackNavigationState<ParamListBase>>;

const isAtLeastOneInState = (state: StackState, screenName: string): boolean => state.routes.some((route) => route.name === screenName);

type AdaptStateIfNecessaryArgs = {
    state: StackState;
    options: SplitNavigatorRouterOptions;
};

function getRoutePolicyID(route: NavigationPartialRoute): string | undefined {
    return (route?.params as Record<string, string> | undefined)?.policyID;
}

function adaptStateIfNecessary({state, options: {sidebarScreen, defaultCentralScreen, parentRoute}}: AdaptStateIfNecessaryArgs) {
    const isNarrowLayout = getIsNarrowLayout();
    const rootState = navigationRef.getRootState();

    const lastRoute = state.routes.at(-1) as NavigationPartialRoute;
    const routePolicyID = getRoutePolicyID(lastRoute);

    // If invalid policy page is displayed on narrow layout, sidebar screen should not be pushed to the navigation state to avoid adding reduntant not found page
    if (isNarrowLayout && !!routePolicyID) {
        if (shouldDisplayPolicyNotFoundPage(routePolicyID)) {
            return;
        }
    }

    // When initializing the app on a small screen with the center screen as the initial screen, the sidebar must also be split to allow users to swipe back.
    const isInitialRoute = !rootState || rootState.routes.length === 1;
    const shouldSplitHaveSidebar = isInitialRoute || !isNarrowLayout;

    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isAtLeastOneInState(state, sidebarScreen) && shouldSplitHaveSidebar) {
        const paramsFromRoute = getParamsFromRoute(sidebarScreen);
        const copiedParams = pick(lastRoute?.params, paramsFromRoute);

        // We don't want to get an empty object as params because it breaks some navigation logic when comparing if routes are the same.
        const params = isEmptyObject(copiedParams) ? undefined : copiedParams;

        // @ts-expect-error Updating read only property
        // noinspection JSConstantReassignment
        state.stale = true; // eslint-disable-line

        // @ts-expect-error Updating read only property
        // Unshift the root screen to fill left pane.
        state.routes.unshift({
            name: sidebarScreen,
            // This handles the case where the sidebar should have params included in the central screen e.g. policyID for workspace initial.
            params,
        });
    }

    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isNarrowLayout) {
        if (state.routes.length === 1 && state.routes[0].name === sidebarScreen) {
            const previousSameNavigator = rootState?.routes.filter((route) => route.name === parentRoute.name).at(-2);

            // If we have optimization for not rendering all split navigators, then last selected option may not be in the state. In this case state has to be read from the preserved state.
            const previousSameNavigatorState = previousSameNavigator?.state ?? (previousSameNavigator?.key ? getPreservedNavigatorState(previousSameNavigator.key) : undefined);
            const previousSelectedCentralScreen =
                previousSameNavigatorState?.routes && previousSameNavigatorState.routes.length > 1 ? previousSameNavigatorState.routes.at(-1)?.name : undefined;

            // @ts-expect-error Updating read only property
            // noinspection JSConstantReassignment
            state.stale = true; // eslint-disable-line

            // @ts-expect-error Updating read only property
            // Push the default settings central pane screen.
            state.routes.push({
                name: previousSelectedCentralScreen ?? defaultCentralScreen,
                params: state.routes.at(0)?.params,
            });
        }
    }
    // eslint-disable-next-line no-param-reassign, @typescript-eslint/non-nullable-type-assertion-style
    (state.index as number) = state.routes.length - 1;
}

function isPushingSidebarOnCentralPane(state: StackState, action: CommonActions.Action | StackActionType, options: SplitNavigatorRouterOptions) {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH && action.payload.name === options.sidebarScreen && state.routes.length > 1;
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
            return stackRouter.getStateForAction(state, action, configOptions);
        },
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const preservedState = getPreservedNavigatorState(options.parentRoute.key);
            const initialState = preservedState ?? stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});

            adaptStateIfNecessary({
                state: initialState,
                options,
            });

            // If we needed to modify the state we need to rehydrate it to get keys for new routes.
            if (initialState.stale) {
                return stackRouter.getRehydratedState(initialState, {routeNames, routeParamList, routeGetIdList});
            }

            return initialState;
        },
        getRehydratedState(partialState: StackState, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            adaptStateIfNecessary({
                state: partialState,
                options,
            });

            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
    };
}

export default SplitRouter;
