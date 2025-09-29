import {CommonActions, findFocusedRoute} from '@react-navigation/native';
import type {ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SetParamsAction} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type {HistoryStackNavigatorAction, SetHistoryParamActionType} from './types';

const CUSTOM_HISTORY_PREFIX = 'CUSTOM_HISTORY';

function isSetParamsAction(action: HistoryStackNavigatorAction): action is SetParamsAction {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS;
}

function isSetHistoryParamAction(action: HistoryStackNavigatorAction): action is SetHistoryParamActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SET_HISTORY_PARAM;
}

// The history can be anything. For now, string is enough but we can extend it to include more data if necessary.
function getCustomHistoryEntry(routeName: string) {
    return `${CUSTOM_HISTORY_PREFIX}-${routeName}`;
}

/**
 * Higher-order function that extends the React Navigation stack router with custom history functionality.
 * It allows tracking and managing navigation history entries that are not determined by the routes of navigator.
 * The extension adds support for custom history entries through route params and maintains a history stack
 * that can be manipulated independently of the navigation state.
 *
 * @param originalStackRouter - The original stack router function to be extended
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
                history: state.routes.map((route) => route.key),
            };
        };

        // Override methods to enhance state with history
        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            const stateWithInitialHistory = enhanceStateWithHistory(state);

            const focusedRoute = findFocusedRoute(stateWithInitialHistory);

            // There always be a focused route in the state. It's for type safety.
            if (!focusedRoute) {
                return stateWithInitialHistory;
            }

            // Custom history param used to show the side panel is handled here
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
            // We want to set the right param and then update the history
            if (isSetHistoryParamAction(action)) {
                const customHistoryEntry = getCustomHistoryEntry(action.payload.key);

                // Start with updating the param.
                const setParamsAction = CommonActions.setParams({[action.payload.key]: action.payload.value});
                const stateWithUpdatedParams = router.getStateForAction(state, setParamsAction, configOptions);

                // This shouldn't ever happen as the history should be always defined. It's for type safety.
                if (!stateWithUpdatedParams?.history) {
                    return stateWithUpdatedParams;
                }

                // If it's set to true, we need to add the history entry if it's not already there.
                if (action.payload.value && stateWithUpdatedParams.history.at(-1) !== customHistoryEntry) {
                    return {...stateWithUpdatedParams, history: [...stateWithUpdatedParams.history, customHistoryEntry]};
                }

                // If it's set to false, we need to remove the history entry if it's there.
                if (!action.payload.value) {
                    return {...stateWithUpdatedParams, history: stateWithUpdatedParams.history.filter((entry) => entry !== customHistoryEntry)};
                }

                // Else, do not change history.
                return stateWithUpdatedParams;
            }

            const newState = router.getStateForAction(state, action, configOptions);

            // If the action was not handled, return null.
            if (!newState) {
                return null;
            }

            // If the action was a setParams action, we need to preserve the history.
            if (isSetParamsAction(action) && state.history) {
                return {
                    ...newState,
                    history: [...state.history],
                };
            }

            // Handle every other action.
            // @ts-expect-error newState can be partial or not. But getRehydratedState will handle it correctly even if the stale === false.
            // And we need to update the history if routes have changed.
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
