import type {CommonActions, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {RemoveFullscreenUnderRHPActionType, ReplaceFullscreenUnderRHPActionType, RootStackNavigatorAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import {enhanceStateWithHistory} from './utils';

function isReplaceFullscreenUnderRHPAction(action: RootStackNavigatorAction): action is ReplaceFullscreenUnderRHPActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP;
}

function isRemoveFullscreenUnderRHPAction(action: RootStackNavigatorAction): action is RemoveFullscreenUnderRHPActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP;
}

/**
 * Higher-order function that extends a React Navigation stack router with history
 * management for the root stack navigator.
 *
 * It maintains a `history` array mirroring the routes and handles two concerns:
 *
 * 1. **Side panel** – preserves the CUSTOM_HISTORY_ENTRY_SIDE_PANEL entry through
 *    rehydration so the side panel open/close state survives navigation state rebuilds.
 *
 * 2. **REPLACE/REMOVE_FULLSCREEN_UNDER_RHP** - freezes the history array for these
 *    actions so that useLinking sees historyDelta=0 and does NOT push/pop any browser
 *    history entries for these intermediate state changes. The correct browser history
 *    update happens later when DISMISS_MODAL pops the RHP in the next animation frame.
 */
function addRootHistoryRouterExtension<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    originalRouter: PlatformStackRouterFactory<ParamListBase, RouterOptions>,
) {
    return (options: RouterOptions): Router<PlatformStackNavigationState<ParamListBase>, CommonActions.Action | StackActionType> => {
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

        const getStateForAction = (state: PlatformStackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType, configOptions: RouterConfigOptions) => {
            const newState = router.getStateForAction(state, action, configOptions);

            if (!newState) {
                return null;
            }

            // For REPLACE/REMOVE_FULLSCREEN_UNDER_RHP we intentionally preserve the original
            // history array so that useLinking sees historyDelta=0 and does NOT push/pop any
            // browser history entries for these intermediate state changes.
            if ((isReplaceFullscreenUnderRHPAction(action) || isRemoveFullscreenUnderRHPAction(action)) && state.history) {
                // @ts-expect-error newState can be partial but getRehydratedState handles it correctly.
                const rehydrated = getRehydratedState(newState, configOptions);
                return {...rehydrated, history: state.history};
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

export default addRootHistoryRouterExtension;
