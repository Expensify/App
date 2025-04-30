import type {CommonActions, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import CONST from '@src/CONST';
import type {HistoryStackNavigatorAction, PopHistoryEntryActionType, PushHistoryEntryActionType, SetParamsActionType} from './types';

function isPushHistoryEntryAction(action: HistoryStackNavigatorAction): action is PushHistoryEntryActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH_HISTORY_ENTRY;
}

function isPopHistoryEntryAction(action: HistoryStackNavigatorAction): action is PopHistoryEntryActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.POP_HISTORY_ENTRY;
}

function isSetParamsAction(action: HistoryStackNavigatorAction): action is SetParamsActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS;
}

function addCustomHistoryRouterExtension<ParamList extends ParamListBase>(
    originalStackRouter: (options: RouterConfigOptions) => Router<StackNavigationState<ParamList>, CommonActions.Action | StackActionType>,
) {
    return (options: RouterConfigOptions): Router<StackNavigationState<ParamList>, CommonActions.Action | StackActionType | HistoryStackNavigatorAction> => {
        const router = originalStackRouter(options);

        const enhanceStateWithHistory = (state: StackNavigationState<ParamList>) => {
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

        const getRehydratedState = (partialState: PartialState<StackNavigationState<ParamList>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            return enhanceStateWithHistory(state);
        };

        const getStateForAction = (
            state: StackNavigationState<ParamList>,
            action: CommonActions.Action | StackActionType | HistoryStackNavigatorAction,
            configOptions: RouterConfigOptions,
        ) => {
            if (isPushHistoryEntryAction(action)) {
                const history = state.history ?? [];
                return {
                    ...state,
                    history: [...history, action.payload.id],
                };
            }

            if (isPopHistoryEntryAction(action)) {
                const history = state.history ?? [];
                return {
                    ...state,
                    history: history.filter((entry) => entry !== action.payload.id),
                };
            }

            const newState = router.getStateForAction(state, action, configOptions);

            if (!newState) {
                return null;
            }

            // We need to preserve the history when setting params
            if (isSetParamsAction(action) && state.history) {
                return {
                    ...newState,
                    history: [...state.history],
                };
            }

            if (newState.stale) {
                // If the state is stale, we need to rehydrate it
                // Rehydrating the state will also update the history
                return getRehydratedState(newState, configOptions);
            }

            // @ts-expect-error newState is not partial because we checked the stale property above
            return getRehydratedState(newState, configOptions);
        };

        // Return enhanced router with overridden methods
        return {
            ...router,
            getInitialState,
            getRehydratedState,
            getStateForAction,
        };
    };
}

export default addCustomHistoryRouterExtension;
