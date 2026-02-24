import {CommonActions, findFocusedRoute} from '@react-navigation/native';
import type {ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SetParamsAction} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type {CustomHistoryEntry, HistoryStackNavigatorAction, PushParamsActionType} from './types';

function isSetParamsAction(action: HistoryStackNavigatorAction): action is SetParamsAction {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS;
}

function isPushParamsAction(action: HistoryStackNavigatorAction): action is PushParamsActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS;
}

/**
 * Higher-order function that extends the React Navigation stack router with custom history functionality.
 * It maintains a separate history stack of route snapshots that can diverge from the routes array,
 * enabling back-navigation through param changes (via PUSH_PARAMS) without requiring additional routes.
 *
 * TODO: Remove this custom history extension after upgrading to React Navigation 8,
 * which has built-in support for a PUSH_PARAMS-like action.
 *
 * NOTE: The PUSH_PARAMS approach is heuristic and only works in the current setup for the
 * SearchFullscreenNavigator. It may break if new screens are added to that navigator or if
 * other structural changes are made to the navigation hierarchy.
 *
 * @param originalRouter - The original stack router function to be extended
 * @returns Enhanced router with custom history functionality
 */

function addCustomHistoryRouterExtension<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    originalRouter: PlatformStackRouterFactory<ParamListBase, RouterOptions>,
) {
    return (options: RouterOptions): Router<PlatformStackNavigationState<ParamListBase>, HistoryStackNavigatorAction> => {
        const router = originalRouter(options);

        const enhanceStateWithHistory = (state: PlatformStackNavigationState<ParamListBase>) => {
            return {
                ...state,
                history: state.routes.map((route) => ({...route})) as CustomHistoryEntry[],
            };
        };

        // Override router methods to attach a history array (route snapshots) alongside routes.
        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            const stateWithInitialHistory = enhanceStateWithHistory(state);

            const focusedRoute = findFocusedRoute(stateWithInitialHistory);

            // There will always be a focused route in the state. This guard is for type safety.
            if (!focusedRoute) {
                return stateWithInitialHistory;
            }

            // Preserve the side panel custom history entry if it was present in the partial state.
            if (state.history?.at(-1) === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL) {
                stateWithInitialHistory.history = [...stateWithInitialHistory.history, CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL];
                return stateWithInitialHistory;
            }

            return stateWithInitialHistory;
        };

        const getStateForAction = (
            state: PlatformStackNavigationState<ParamListBase>,
            action: CommonActions.Action | StackActionType | HistoryStackNavigatorAction,
            configOptions: RouterConfigOptions,
        ) => {
            if (isPushParamsAction(action)) {
                const setParamsAction = CommonActions.setParams(action.payload.params);
                const stateWithUpdatedParams = router.getStateForAction(state, setParamsAction, configOptions);

                if (!stateWithUpdatedParams?.history) {
                    return stateWithUpdatedParams;
                }

                const lastRoute = stateWithUpdatedParams.routes.at(-1);

                if (lastRoute) {
                    return {...stateWithUpdatedParams, history: [...stateWithUpdatedParams.history, lastRoute]};
                }

                return stateWithUpdatedParams;
            }

            const newState = router.getStateForAction(state, action, configOptions);

            // Action was not handled by the underlying router.
            if (!newState) {
                return null;
            }

            // SET_PARAMS should not alter the history stack — keep the existing history as-is.
            if (isSetParamsAction(action) && state.history) {
                return {
                    ...newState,
                    history: [...state.history],
                };
            }

            // For all other actions, rebuild history from the updated routes.
            // @ts-expect-error newState may be partial, but getRehydratedState handles both partial and full states correctly.
            return getRehydratedState(newState, configOptions);
        };

        return {
            ...router,
            getInitialState,
            getRehydratedState,
            getStateForAction,
        };
    };
}

export default addCustomHistoryRouterExtension;
