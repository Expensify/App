import type {ParamListBase, PartialState, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import {StackRouter} from '@react-navigation/native';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import SCREENS from '@src/SCREENS';
import type {FullScreenNavigatorRouterOptions} from './types';

type StackState = StackNavigationState<ParamListBase> | PartialState<StackNavigationState<ParamListBase>>;

const isAtLeastOneInState = (state: StackState, screenName: string): boolean => state.routes.some((route) => route.name === screenName);

function adaptStateIfNecessary(state: StackState) {
    const isNarrowLayout = getIsNarrowLayout();
    const workspaceCentralPane = state.routes.at(-1);
    const topmostWorkspaceCentralPaneRoute = workspaceCentralPane?.state?.routes[0];

    // When a screen from the FullScreenNavigator is opened from the deeplink then params should be passed to SCREENS.WORKSPACE.INITIAL from the variable defined below.
    const workspacesCentralPaneParams =
        workspaceCentralPane?.params && 'params' in workspaceCentralPane.params ? (workspaceCentralPane.params.params as Record<string, string | undefined>) : undefined;

    // There should always be WORKSPACE.INITIAL screen in the state to make sure go back works properly if we deeplinkg to a subpage of settings.
    if (!isAtLeastOneInState(state, SCREENS.WORKSPACE.INITIAL)) {
        // @ts-expect-error Updating read only property
        // noinspection JSConstantReassignment
        state.stale = true; // eslint-disable-line

        // This is necessary for ts to narrow type down to PartialState.
        if (state.stale === true) {
            // Unshift the root screen to fill left pane.
            state.routes.unshift({
                name: SCREENS.WORKSPACE.INITIAL,
                params: topmostWorkspaceCentralPaneRoute?.params ?? workspacesCentralPaneParams,
            });
        }
    }

    // If the screen is wide, there should be at least two screens inside:
    // - WORKSPACE.INITIAL to cover left pane.
    // - WORKSPACES_CENTRAL_PANE to cover central pane.
    if (!isNarrowLayout) {
        if (!isAtLeastOneInState(state, SCREENS.WORKSPACES_CENTRAL_PANE)) {
            // @ts-expect-error Updating read only property
            // noinspection JSConstantReassignment
            state.stale = true; // eslint-disable-line
            // Push the default settings central pane screen.
            if (state.stale === true) {
                state.routes.push({
                    name: SCREENS.WORKSPACES_CENTRAL_PANE,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.PROFILE,
                                params: state.routes[0]?.params,
                            },
                        ],
                    },
                });
            }
        }
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/non-nullable-type-assertion-style
        (state.index as number) = state.routes.length - 1;
    }
}

function CustomFullScreenRouter(options: FullScreenNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const initialState = stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
            adaptStateIfNecessary(initialState);

            // If we needed to modify the state we need to rehydrate it to get keys for new routes.
            if (initialState.stale) {
                return stackRouter.getRehydratedState(initialState, {routeNames, routeParamList, routeGetIdList});
            }

            return initialState;
        },
        getRehydratedState(partialState: StackState, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            adaptStateIfNecessary(partialState);
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
    };
}

export default CustomFullScreenRouter;
