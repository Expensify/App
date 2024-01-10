import type {NavigationState, ParamListBase, PartialState, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import {StackRouter} from '@react-navigation/native';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import SCREENS from '@src/SCREENS';
import type {FullScreenNavigatorRouterOptions} from './types';

// TODO: export states to separate file
type State = NavigationState | PartialState<NavigationState>;

const isAtLeastOneInState = (state: State, screenName: string): boolean => !!state.routes.find((route) => route.name === screenName);

/**
 * Adds central pane to the full screen settings
 */
const addCentralPaneNavigatorRoute = (state: State) => {
    const centralPaneNavigatorRoute = {
        name: SCREENS.SETTINGS_CENTRAL_PANE,
        state: {
            routes: [
                {
                    name: SCREENS.SETTINGS.PROFILE.ROOT,
                },
            ],
        },
    };
    state.routes.splice(1, 0, centralPaneNavigatorRoute);
    // eslint-disable-next-line no-param-reassign, @typescript-eslint/non-nullable-type-assertion-style
    (state.index as number) = state.routes.length - 1;
};

function CustomFullScreenRouter(options: FullScreenNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const isSmallScreenWidth = getIsSmallScreenWidth();
            const initialState = stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
            if (!isAtLeastOneInState(initialState, SCREENS.SETTINGS_CENTRAL_PANE) && !isSmallScreenWidth) {
                addCentralPaneNavigatorRoute(initialState);
            }
            return initialState;
        },
        getRehydratedState(partialState: StackNavigationState<ParamListBase>, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            const isSmallScreenWidth = getIsSmallScreenWidth();
            if (!isAtLeastOneInState(partialState, SCREENS.SETTINGS_CENTRAL_PANE) && !isSmallScreenWidth) {
                // If we added a route we need to make sure that the state.stale is true to generate new key for this route

                // eslint-disable-next-line no-param-reassign
                (partialState.stale as boolean) = true;
                addCentralPaneNavigatorRoute(partialState);
            }
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
    };
}

export default CustomFullScreenRouter;
