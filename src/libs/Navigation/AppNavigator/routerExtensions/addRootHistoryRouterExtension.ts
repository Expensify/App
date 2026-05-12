import type {CommonActions, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {RemoveFullscreenUnderRHPActionType, ReplaceFullscreenUnderRHPActionType, RootStackNavigatorAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import {enhanceStateWithHistory} from './utils';

const CUSTOM_HISTORY_MARKERS: ReadonlySet<string> = new Set([CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL, CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR]);

/**
 * Walks a history array from the end and collects the contiguous run of known
 * custom-history markers (e.g. `[...routes, SIDE_PANEL, MFA_MODAL_NAVIGATOR]` →
 * `[SIDE_PANEL, MFA_MODAL_NAVIGATOR]`).
 *
 * `enhanceStateWithHistory` regenerates `history` purely from `routes` and drops
 * any non-route entries; this helper lets the rehydration step re-append the
 * markers that were on top before rebuild.
 */
function extractTrailingCustomMarkers(history: readonly unknown[] | undefined): string[] {
    if (!history?.length) {
        return [];
    }
    const cutoff = history.findLastIndex((entry) => typeof entry !== 'string' || !CUSTOM_HISTORY_MARKERS.has(entry));
    return history.slice(cutoff + 1).filter((entry): entry is string => typeof entry === 'string');
}

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
 * 1. **Custom history markers** – preserves trailing `CUSTOM_HISTORY_ENTRY_*` markers
 *    (side panel, MFA modal navigator) through rehydration so their open/close state
 *    survives navigation state rebuilds.
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

            const trailingMarkers = extractTrailingCustomMarkers(state.history);
            if (trailingMarkers.length > 0) {
                stateWithInitialHistory.history = [...stateWithInitialHistory.history, ...trailingMarkers];
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
