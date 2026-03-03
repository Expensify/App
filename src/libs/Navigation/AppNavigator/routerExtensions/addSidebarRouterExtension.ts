import type {CommonActions, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import type {HistoryStackNavigatorAction} from './types';
import {enhanceStateWithHistory} from './utils';

/**
 * Higher-order function that extends a React Navigation stack router with sidebar history functionality.
 * It maintains a `history` array mirroring the routes, and preserves the CUSTOM_HISTORY_ENTRY_SIDE_PANEL
 * entry through rehydration so the side panel open/close state survives navigation state rebuilds.
 *
 * This extension is intended only for the root stack navigator.
 */
function addSidebarRouterExtension<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(originalRouter: PlatformStackRouterFactory<ParamListBase, RouterOptions>) {
    return (options: RouterOptions): Router<PlatformStackNavigationState<ParamListBase>, HistoryStackNavigatorAction> => {
        const router = originalRouter(options);

        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            const stateWithInitialHistory = enhanceStateWithHistory(state);

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
            const newState = router.getStateForAction(state, action, configOptions);

            if (!newState) {
                return null;
            }

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

export default addSidebarRouterExtension;
