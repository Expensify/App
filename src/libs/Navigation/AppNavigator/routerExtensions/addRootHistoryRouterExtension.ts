import type {ParamListBase, PartialState, Router, RouterConfigOptions} from '@react-navigation/native';
import Log from '@libs/Log';
import type {RootStackNavigatorAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import {
    applyRevealPaddingOffset,
    getFrozenHistoryStateForRemoveFullscreenUnderRHP,
    getFrozenHistoryStateForReplaceFullscreenUnderRHP,
    getRevealDismissState,
    isDismissModalAction,
    isRemoveFullscreenUnderRHPAction,
    isReplaceFullscreenUnderRHPAction,
} from './addRootHistoryRouterExtensionUtils';
import type {PendingReveal, RootHistoryState} from './addRootHistoryRouterExtensionUtils';
import {enhanceStateWithHistory} from './utils';

/** Manages root `state.history` for side-panel + reveal flows; per-branch rationale inline. */
function addRootHistoryRouterExtension<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    originalRouter: PlatformStackRouterFactory<ParamListBase, RouterOptions>,
) {
    return (options: RouterOptions): Router<PlatformStackNavigationState<ParamListBase>, RootStackNavigatorAction> => {
        const router = originalRouter(options);

        // RHP snapshot taken on REPLACE; matching DISMISS must equal all three fields (key,
        // routes depth, history depth) to commit the reveal freeze.
        let pendingReveal: PendingReveal | null = null;

        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            const stateWithInitialHistory = enhanceStateWithHistory(state);

            // Preserve trailing side-panel sentinel through state rebuilds.
            if (state.history?.at(-1) === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL) {
                stateWithInitialHistory.history = [...stateWithInitialHistory.history, CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL];
                return stateWithInitialHistory;
            }

            return stateWithInitialHistory;
        };

        // Centralizes the `PartialState | FullState` cast to `getRehydratedState`'s input shape.
        function rehydrate(newState: PartialState<RootHistoryState> | RootHistoryState, configOptions: RouterConfigOptions) {
            return getRehydratedState(newState as PartialState<RootHistoryState>, configOptions);
        }

        const getStateForAction = (state: RootHistoryState, action: RootStackNavigatorAction, configOptions: RouterConfigOptions) => {
            // Snapshot is stale if its RHP key vanished via a non-DISMISS path.
            if (pendingReveal && !state.routes.some((r) => r.key === pendingReveal?.rhpKey)) {
                Log.hmmm('[addRootHistoryRouterExtension] pending reveal RHP no longer in routes; clearing snapshot', {pendingReveal});
                pendingReveal = null;
            }

            const newState = router.getStateForAction(state, action, configOptions);

            if (!newState) {
                return null;
            }

            // REPLACE: capture pending reveal + freeze history (intermediate frame; useLinking historyDelta=0).
            if (isReplaceFullscreenUnderRHPAction(action)) {
                const result = getFrozenHistoryStateForReplaceFullscreenUnderRHP(state, newState, configOptions, pendingReveal, rehydrate);
                pendingReveal = result.pendingReveal;
                return result.state;
            }

            // REMOVE: cancel path; clear snapshot + freeze history (same rationale as REPLACE).
            if (isRemoveFullscreenUnderRHPAction(action)) {
                const result = getFrozenHistoryStateForRemoveFullscreenUnderRHP(state, newState, configOptions, rehydrate);
                if (state.history) {
                    pendingReveal = null;
                }
                return result;
            }

            // DISMISS that completes the reveal: pad new history to pre-DISMISS length so
            // useLinking sees historyDelta=0 and just `history.replace`s the current entry,
            // preserving the prior fullscreen browser entry. (RN 7.x useLinking semantics.)
            if (isDismissModalAction(action) && pendingReveal && state.history) {
                const result = getRevealDismissState(state, newState, configOptions, pendingReveal, rehydrate);
                pendingReveal = result.pendingReveal;
                if (result.state) {
                    return result.state;
                }
            }

            // Default: re-apply the offset (single source of truth = leading sentinels in
            // state.history). addPushParamsRouterExtension keeps all string entries, so
            // reveal-padding sentinels survive PUSH_PARAMS / GO_BACK / POP / RESET dispatches.
            const rehydrated = rehydrate(newState, configOptions);
            return applyRevealPaddingOffset(state, rehydrated);
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
