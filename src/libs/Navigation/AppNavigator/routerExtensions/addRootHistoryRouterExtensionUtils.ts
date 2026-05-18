import type {ParamListBase, PartialState, RouterConfigOptions} from '@react-navigation/native';
import Log from '@libs/Log';
import type {
    DismissModalActionType,
    RemoveFullscreenUnderRHPActionType,
    ReplaceFullscreenUnderRHPActionType,
    RootStackNavigatorAction,
} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {CustomHistoryEntry} from './types';

type RootHistoryState = PlatformStackNavigationState<ParamListBase>;
type PendingReveal = {rhpKey: string; routesLengthAtCapture: number; historyLengthAtCapture: number};
type RehydrateRootHistoryState = (newState: PartialState<RootHistoryState> | RootHistoryState, configOptions: RouterConfigOptions) => RootHistoryState;

function isReplaceFullscreenUnderRHPAction(action: RootStackNavigatorAction): action is ReplaceFullscreenUnderRHPActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP;
}

function isRemoveFullscreenUnderRHPAction(action: RootStackNavigatorAction): action is RemoveFullscreenUnderRHPActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP;
}

function isDismissModalAction(action: RootStackNavigatorAction): action is DismissModalActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
}

function isRightModalNavigatorRouteName(name: string | undefined): boolean {
    return name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
}

/** Centralizes the cast from PlatformStackNavigationState's `unknown[]` history slot to our typed array. */
function asCustomHistory(history: unknown[] | undefined): CustomHistoryEntry[] | undefined {
    return history as CustomHistoryEntry[] | undefined;
}

/** Counts the leading `CUSTOM_HISTORY_ENTRY_REVEAL_PADDING` sentinels in a history array. */
function countLeadingRevealPadding(history: CustomHistoryEntry[] | undefined): number {
    if (!history?.length) {
        return 0;
    }
    let count = 0;
    // Count how many fake history slots we previously added to keep browser history aligned.
    for (const entry of history) {
        if (entry === CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_REVEAL_PADDING) {
            count += 1;
        } else {
            break;
        }
    }
    return count;
}

/** Returns a fresh history array with `offset` reveal-padding sentinels prepended. */
function buildPaddedHistory(baseHistory: CustomHistoryEntry[], offset: number): CustomHistoryEntry[] {
    if (offset <= 0) {
        return [...baseHistory];
    }
    const padding = new Array<CustomHistoryEntry>(offset).fill(CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_REVEAL_PADDING);
    return [...padding, ...baseHistory];
}

function getFrozenHistoryStateForReplaceFullscreenUnderRHP(
    state: RootHistoryState,
    newState: PartialState<RootHistoryState> | RootHistoryState,
    configOptions: RouterConfigOptions,
    pendingReveal: PendingReveal | null,
    rehydrate: RehydrateRootHistoryState,
): {pendingReveal: PendingReveal | null; state: RootHistoryState} {
    if (!state.history) {
        Log.hmmm('[addRootHistoryRouterExtension] REPLACE_FULLSCREEN_UNDER_RHP arrived with undefined state.history; reveal will not freeze');
        return {pendingReveal, state: rehydrate(newState, configOptions)};
    }

    // Capture the RHP that should be dismissed in the second half of the reveal.
    const topRoute = state.routes.at(-1);
    const postReplaceRoutesLength = (newState.routes ?? state.routes).length;
    const nextPendingReveal =
        topRoute && isRightModalNavigatorRouteName(topRoute.name)
            ? {
                  rhpKey: topRoute.key,
                  routesLengthAtCapture: postReplaceRoutesLength,
                  historyLengthAtCapture: state.history.length,
              }
            : pendingReveal;

    // Use the new routes but freeze old history for this hidden intermediate frame.
    // Defensive copy of state.history (shared reference; freeze must not alias).
    return {pendingReveal: nextPendingReveal, state: {...rehydrate(newState, configOptions), history: [...state.history]}};
}

function getFrozenHistoryStateForRemoveFullscreenUnderRHP(
    state: RootHistoryState,
    newState: PartialState<RootHistoryState> | RootHistoryState,
    configOptions: RouterConfigOptions,
    rehydrate: RehydrateRootHistoryState,
): RootHistoryState {
    if (!state.history) {
        Log.hmmm('[addRootHistoryRouterExtension] REMOVE_FULLSCREEN_UNDER_RHP arrived with undefined state.history');
        return rehydrate(newState, configOptions);
    }

    // Cancel path: remove the pre-inserted screen while keeping browser history still.
    return {...rehydrate(newState, configOptions), history: [...state.history]};
}

function getRevealDismissState(
    state: RootHistoryState,
    newState: PartialState<RootHistoryState> | RootHistoryState,
    configOptions: RouterConfigOptions,
    pendingReveal: PendingReveal,
    rehydrate: RehydrateRootHistoryState,
): {pendingReveal: PendingReveal | null; state?: RootHistoryState} {
    // This is the stack before closing the RHP; the top route is the one DISMISS removes.
    const dismissingTopKey = state.routes.at(-1)?.key;
    const depthMatches = state.routes.length === pendingReveal.routesLengthAtCapture;
    const historyDepthMatches = state.history?.length === pendingReveal.historyLengthAtCapture;

    // Apply the reveal fix only when this DISMISS closes the same RHP we snapshotted.
    if (dismissingTopKey === pendingReveal.rhpKey && depthMatches && historyDepthMatches) {
        const rehydrated = rehydrate(newState, configOptions);
        const rehydratedHistory = asCustomHistory(rehydrated.history) ?? [];
        // rehydratedHistory already includes any trailing SIDE_PANEL sentinel,
        // so it does not inflate the computed offset.
        const lengthDelta = (state.history?.length ?? 0) - rehydratedHistory.length;
        if (lengthDelta > 0) {
            Log.hmmm(`[addRootHistoryRouterExtension] reveal committed; freezing history with offset ${lengthDelta}`);
            // Keep the pre-dismiss history length so web linking replaces instead of going back.
            return {pendingReveal: null, state: {...rehydrated, history: buildPaddedHistory(rehydratedHistory, lengthDelta)}};
        }
        Log.hmmm('[addRootHistoryRouterExtension] reveal committed with non-positive lengthDelta; no freeze', {lengthDelta});
        return {pendingReveal: null};
    }

    if (dismissingTopKey === pendingReveal.rhpKey) {
        // Same RHP, but the stack/history changed unexpectedly; skip the special reveal fix.
        Log.hmmm('[addRootHistoryRouterExtension] reveal snapshot key matched but depth diverged; clearing without freeze', {
            capturedRoutesLength: pendingReveal.routesLengthAtCapture,
            currentRoutesLength: state.routes.length,
            capturedHistoryLength: pendingReveal.historyLengthAtCapture,
            currentHistoryLength: state.history?.length,
        });
        return {pendingReveal: null};
    }

    return {pendingReveal};
}

function applyRevealPaddingOffset(state: RootHistoryState, rehydrated: RootHistoryState): RootHistoryState {
    // Regular navigation rebuilds history from routes; put back any fake slots already in use.
    const offset = countLeadingRevealPadding(asCustomHistory(state.history));
    if (offset > 0) {
        return {...rehydrated, history: buildPaddedHistory(asCustomHistory(rehydrated.history) ?? [], offset)};
    }
    return rehydrated;
}

export type {PendingReveal, RehydrateRootHistoryState, RootHistoryState};
export {
    applyRevealPaddingOffset,
    getFrozenHistoryStateForRemoveFullscreenUnderRHP,
    getFrozenHistoryStateForReplaceFullscreenUnderRHP,
    getRevealDismissState,
    isDismissModalAction,
    isRemoveFullscreenUnderRHPAction,
    isReplaceFullscreenUnderRHPAction,
};
