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
import type SplitNavigatorRouterOptions from './types';
import {getPreservedNavigatorState} from './usePreserveNavigatorState';

type StackState = StackNavigationState<ParamListBase> | PartialState<StackNavigationState<ParamListBase>>;

type AdaptStateIfNecessaryArgs = {
    state: StackState;
    options: SplitNavigatorRouterOptions;
};

const isAtLeastOneInState = (state: StackState, screenName: string): boolean => state.routes.some((route) => route.name === screenName);

function getRoutePolicyID(route: NavigationPartialRoute): string | undefined {
    return (route?.params as Record<string, string> | undefined)?.policyID;
}

function adaptStateIfNecessary({state, options: {sidebarScreen, defaultCentralScreen, parentRoute}}: AdaptStateIfNecessaryArgs) {
    const isNarrowLayout = getIsNarrowLayout();
    const rootState = navigationRef.getRootState();

    const lastRoute = state.routes.at(-1) as NavigationPartialRoute;
    const routePolicyID = getRoutePolicyID(lastRoute);

    let routes = [...state.routes];
    let modified = false;

    if (isNarrowLayout && !!routePolicyID) {
        if (shouldDisplayPolicyNotFoundPage(routePolicyID)) {
            return state; // state is unchanged
        }
    }

    // When initializing the app on a small screen with the center screen as the initial screen, the sidebar must also be split to allow users to swipe back.
    const isInitialRoute = !rootState || rootState.routes.length === 1;
    const shouldSplitHaveSidebar = isInitialRoute || !isNarrowLayout;

    if (!isAtLeastOneInState(state, sidebarScreen) && shouldSplitHaveSidebar) {
        const paramsFromRoute = getParamsFromRoute(sidebarScreen);
        const copiedParams = pick(lastRoute?.params, paramsFromRoute);
        const params = isEmptyObject(copiedParams) ? undefined : copiedParams;

        routes = [
            {
                name: sidebarScreen,
                params,
            },
            ...routes,
        ];
        modified = true;
    }

    if (!isNarrowLayout) {
        if (routes.length === 1 && routes.at(0)?.name === sidebarScreen) {
            const previousSameNavigator = rootState?.routes.filter((route) => route.name === parentRoute.name).at(-2);

            const previousSameNavigatorState = previousSameNavigator?.state ?? (previousSameNavigator?.key ? getPreservedNavigatorState(previousSameNavigator.key) : undefined);
            const previousSelectedCentralScreen =
                previousSameNavigatorState?.routes && previousSameNavigatorState.routes.length > 1 ? previousSameNavigatorState.routes.at(-1)?.name : undefined;

            routes = [
                ...routes,
                {
                    name: previousSelectedCentralScreen ?? defaultCentralScreen,
                    params: routes.at(0)?.params,
                },
            ];
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
            let state: StackState = getPreservedNavigatorState(options.parentRoute.key) ?? stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});

            state = adaptStateIfNecessary({state, options});

            // If we needed to modify the state we need to rehydrate it to get keys for new routes.
            if (state.stale) {
                return stackRouter.getRehydratedState(state, {routeNames, routeParamList, routeGetIdList});
            }

            return state as StackNavigationState<ParamListBase>;
        },

        getRehydratedState(partialState: StackState, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            const adaptedState = adaptStateIfNecessary({state: partialState, options});
            return stackRouter.getRehydratedState(adaptedState, {routeNames, routeParamList, routeGetIdList});
        },
    };
}

export default SplitRouter;
