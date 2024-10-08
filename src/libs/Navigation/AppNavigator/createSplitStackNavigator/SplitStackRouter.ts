import type {CommonActions, ParamListBase, PartialState, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions, StackRouter} from '@react-navigation/native';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import type {SplitStackNavigatorRouterOptions} from './types';

type StackState = StackNavigationState<ParamListBase> | PartialState<StackNavigationState<ParamListBase>>;

const isAtLeastOneInState = (state: StackState, screenName: string): boolean => state.routes.some((route) => route.name === screenName);

type AdaptStateIfNecessaryArgs = {
    state: StackState;
    options: SplitStackNavigatorRouterOptions;
};

function adaptStateIfNecessary({state, options: {sidebarScreen, defaultCentralScreen, parentRoute}}: AdaptStateIfNecessaryArgs) {
    const isNarrowLayout = getIsNarrowLayout();

    // @TODO leftover from times when there was fullscreen navigator only for the workspaces.
    const workspaceCentralPane = state.routes.at(-1);

    // There should always be sidebarScreen screen in the state to make sure go back works properly if we deeplinkg to a subpage of settings.
    if (!isAtLeastOneInState(state, sidebarScreen) && !isNarrowLayout) {
        // @ts-expect-error Updating read only property
        // noinspection JSConstantReassignment
        state.stale = true; // eslint-disable-line

        // This is necessary for typescript to narrow type down to PartialState.
        if (state.stale === true) {
            // Unshift the root screen to fill left pane.
            state.routes.unshift({
                name: sidebarScreen,
                // @TODO why we need to pass params here?
                params: workspaceCentralPane?.params,
            });
        }
    }

    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isNarrowLayout) {
        if (state.routes.length === 1 && state.routes[0].name === sidebarScreen) {
            const rootState = navigationRef.getRootState();

            // @TODO: If we have optimization for not rendering all split navigators, then last selected option won't be in the state.
            // @TODO: Do we want to use previous selected screen if the policyID is different.
            const previousSameNavigator = rootState?.routes.findLast((route) => route.name === parentRoute.name && route.state !== undefined);
            const previousSelectedCentralScreen =
                previousSameNavigator?.state?.routes && previousSameNavigator.state.routes.length > 1 ? previousSameNavigator.state.routes.at(-1)?.name : undefined;

            // @ts-expect-error Updating read only property
            // noinspection JSConstantReassignment
            state.stale = true; // eslint-disable-line
            // Push the default settings central pane screen.
            if (state.stale === true) {
                state.routes.push({
                    name: previousSelectedCentralScreen ?? defaultCentralScreen,
                    params: state.routes.at(0)?.params,
                });
            }
        }
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/non-nullable-type-assertion-style
        (state.index as number) = state.routes.length - 1;
    }
}

function isPushingSidebarOnCentralPane(state: StackState, action: CommonActions.Action | StackActionType, options: SplitStackNavigatorRouterOptions) {
    if (action.type === 'PUSH' && action.payload.name === options.sidebarScreen && state.routes.length > 1) {
        return true;
    }
    return false;
}

function SplitStackRouter(options: SplitStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);
    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType, configOptions: RouterConfigOptions) {
            if (isPushingSidebarOnCentralPane(state, action, options)) {
                if (getIsNarrowLayout()) {
                    // @TODO: It's possible that it's better to push whole new SplitNavigator in such case. Not sure yet.
                    const newAction = StackActions.popToTop();
                    return stackRouter.getStateForAction(state, newAction, configOptions);
                }
                // On wide screen do nothing as we want to keep the central pane screen and the sidebar is visible.
                return state;
            }
            return stackRouter.getStateForAction(state, action, configOptions);
        },
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const initialState = stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});

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

export default SplitStackRouter;
