import type {ParamListBase, PartialState, Router, RouterConfigOptions} from '@react-navigation/native';
import Log from '@libs/Log';
import type {RootStackNavigatorAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import {
    applyRevealPaddingOffset,
    asCustomHistory,
    getFrozenHistoryStateForRemoveFullscreenUnderRHP,
    getFrozenHistoryStateForReplaceFullscreenUnderRHP,
    getRevealDismissState,
    getTrailingStringSentinels,
    isDismissModalAction,
    isModalHistorySentinel,
    isRemoveFullscreenUnderRHPAction,
    isReplaceFullscreenUnderRHPAction,
    stripTrailingModalSentinels,
} from './addRootHistoryRouterExtensionUtils';
import type {PendingReveal, RootHistoryState} from './addRootHistoryRouterExtensionUtils';
import {enhanceStateWithHistory} from './utils';

/** Manages root `state.history` for side-panel, per-modal back-guards, and reveal flows; per-branch rationale inline. */
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

            // Preserve the trailing run of string sentinels (side-panel + per-modal back-guards) through
            // state rebuilds, so those overlays stay open and their browser entries aren't stranded by a
            // benign history rebuild (e.g. RESET / resize). The forward-navigation consume in
            // getStateForAction is what intentionally drops a modal sentinel.
            const trailingSentinels = getTrailingStringSentinels(state.history);
            if (trailingSentinels.length > 0) {
                stateWithInitialHistory.history = [...(asCustomHistory(stateWithInitialHistory.history) ?? []), ...trailingSentinels];
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

            const rehydrated = rehydrate(newState, configOptions);

            // forward navigation out of a `shouldHandleNavigationBack` Modal. The previous state
            // had a trailing modal back-guard sentinel; rehydrate() re-appends it on top of the freshly
            // pushed route, which would strand a phantom browser entry (Back needing two presses). Drop only
            // the top modal sentinel so the new history length matches the previous one and useLinking
            // sees historyDelta === 0 → history.replace, letting the new screen consume the guard entry.
            // Removing only the top sentinel preserves any outer modal guards when modals are nested.
            // The RN routes array still records a real push (done by the inner router), so in-app back is
            // unaffected. Either ordering works: if the Modal's own toggle(false) ran first, the trailing
            // entry is already a route and this is a no-op.
            const isForwardNavigation = action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH || action.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE;
            if (isForwardNavigation && isModalHistorySentinel(asCustomHistory(state.history)?.at(-1))) {
                const consumedHistory = stripTrailingModalSentinels(asCustomHistory(rehydrated.history) ?? []);
                return applyRevealPaddingOffset(state, {...rehydrated, history: consumedHistory});
            }

            // Default: re-apply the offset (single source of truth = leading sentinels in
            // state.history). addPushParamsRouterExtension keeps all string entries, so
            // reveal-padding sentinels survive PUSH_PARAMS / GO_BACK / POP / RESET dispatches.
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
