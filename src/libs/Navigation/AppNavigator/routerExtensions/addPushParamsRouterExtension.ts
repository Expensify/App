import {CommonActions} from '@react-navigation/native';
import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {GoBackAction, SetParamsAction} from '@libs/Navigation/types';
import {cancelPendingFocusRestore, compoundParamsKey, notifyPushParamsBackward, notifyPushParamsForward} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';
import type {CustomHistoryEntry, PushParamsActionType, PushParamsRouterAction} from './types';
import {enhanceStateWithHistory} from './utils';

function preserveHistoryForRoutes(oldHistory: CustomHistoryEntry[], routes: Array<{key?: string}>): CustomHistoryEntry[] {
    const remainingKeys = new Set(routes.map((r) => r.key));
    return oldHistory.filter((entry) => typeof entry === 'string' || remainingKeys.has(entry.key));
}

// noop=match at cursor; backward/forward=move cursor to match; unknown=target not in history.
type ResetOutcome = {type: 'noop'; cursor: number} | {type: 'backward'; cursor: number} | {type: 'forward'; cursor: number} | {type: 'unknown'};

function resolveCursorForReset(history: CustomHistoryEntry[], currentCursor: number, newFocused: {key: string; params: unknown}): ResetOutcome {
    const inRange = currentCursor >= 0 && currentCursor < history.length;
    // Snapped cursor drives direction inference only; adjacent probes are gated on inRange.
    const cursor = inRange ? currentCursor : history.length - 1;
    const newCompound = compoundParamsKey(newFocused.key, newFocused.params);

    const matchAt = (idx: number): boolean => {
        if (idx < 0 || idx >= history.length) {
            return false;
        }
        const entry = history.at(idx);
        if (typeof entry === 'string' || !entry || entry.key !== newFocused.key) {
            return false;
        }
        return compoundParamsKey(entry.key, entry.params) === newCompound;
    };

    if (inRange) {
        if (matchAt(cursor)) {
            // Same compound at cursor (e.g. useNavigationResetOnLayoutChange).
            return {type: 'noop', cursor};
        }
        // Backward preferred for duplicate compounds ([A, B, A] at cursor 1 targeting A).
        if (matchAt(cursor - 1)) {
            return {type: 'backward', cursor: cursor - 1};
        }
        if (matchAt(cursor + 1)) {
            return {type: 'forward', cursor: cursor + 1};
        }
    }
    // Non-adjacent jump or out-of-range cursor: scan whole history.
    for (let i = 0; i < history.length; i += 1) {
        if (matchAt(i)) {
            return i < cursor ? {type: 'backward', cursor: i} : {type: 'forward', cursor: i};
        }
    }
    return {type: 'unknown'};
}

function isSetParamsAction(action: PushParamsRouterAction): action is SetParamsAction {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS;
}

function isPushParamsAction(action: PushParamsRouterAction): action is PushParamsActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS;
}

function isGoBackAction(action: PushParamsRouterAction): action is GoBackAction {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK;
}

function isPopAction(action: PushParamsRouterAction): boolean {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.POP;
}

/**
 * Higher-order function that extends a stack router with push-params history functionality.
 * It maintains a separate history stack of route snapshots that can diverge from the routes array,
 * enabling back-navigation through param changes (via PUSH_PARAMS) without requiring additional routes.
 *
 * This extension handles:
 * - PUSH_PARAMS: sets params on the focused route and appends a snapshot to history
 * - GO_BACK/POP: reverts params to the previous snapshot when surplus history exists for the same route
 * - SET_PARAMS: preserves existing history unchanged
 * - RESET: preserves history entries for routes that survive the reset
 *
 * TODO: Remove this custom history extension after upgrading to React Navigation 8,
 * which has built-in support for a PUSH_PARAMS-like action.
 *
 * NOTE: The PUSH_PARAMS approach is heuristic and only works in the current setup for the
 * SearchFullscreenNavigator. It may break if new screens are added to that navigator or if
 * other structural changes are made to the navigation hierarchy.
 */
function addPushParamsRouterExtension<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    originalRouter: PlatformStackRouterFactory<ParamListBase, RouterOptions>,
) {
    return (options: RouterOptions): Router<PlatformStackNavigationState<ParamListBase>, PushParamsRouterAction> => {
        const router = originalRouter(options);
        // lastIndex is ambiguous for duplicates (A→B→A), so we track cursor explicitly. Per-router so tests stay isolated.
        let pushParamsHistoryPosition = -1;

        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            return enhanceStateWithHistory(state);
        };

        const getStateForAction = (
            state: PlatformStackNavigationState<ParamListBase>,
            action: CommonActions.Action | StackActionType | PushParamsRouterAction,
            configOptions: RouterConfigOptions,
        ) => {
            if (isPushParamsAction(action)) {
                // Capture against outgoing (pre-update) params so GO_BACK can restore to it.
                const outgoingRoute = state.routes.at(-1);
                if (outgoingRoute?.key) {
                    notifyPushParamsForward(outgoingRoute.key, outgoingRoute.params);
                }

                const setParamsAction = CommonActions.setParams(action.payload.params);
                const stateWithUpdatedParams = router.getStateForAction(state, setParamsAction, configOptions);

                if (!stateWithUpdatedParams?.history) {
                    return stateWithUpdatedParams;
                }

                const lastRoute = stateWithUpdatedParams.routes.at(-1);

                if (lastRoute) {
                    // Mirror window.history.pushState: pushing mid-cursor discards forward entries.
                    const existingHistory = stateWithUpdatedParams.history;
                    const baseHistory =
                        pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < existingHistory.length - 1 ? existingHistory.slice(0, pushParamsHistoryPosition + 1) : existingHistory;
                    const newHistory = [...baseHistory, lastRoute];
                    pushParamsHistoryPosition = newHistory.length - 1;
                    return {...stateWithUpdatedParams, history: newHistory};
                }

                return stateWithUpdatedParams;
            }

            // No browser history on native — intercept GO_BACK/POP to revert params to the prior snapshot (what the browser does via popstate on web).
            if ((isGoBackAction(action) || isPopAction(action)) && state.history) {
                const routeHistoryEntries = state.history.filter((entry): entry is NavigationRoute<ParamListBase, string> => typeof entry !== 'string');

                if (routeHistoryEntries.length > state.routes.length) {
                    const lastRoute = state.routes.at(-1);
                    if (lastRoute) {
                        // Cursor-relative, not last-two: last-two drifts out of sync after a mid-cursor browser-back RESET.
                        const history = state.history as CustomHistoryEntry[];
                        const currentIdx = pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < history.length ? pushParamsHistoryPosition : history.length - 1;
                        const currentEntry = history.at(currentIdx);

                        if (currentEntry && typeof currentEntry !== 'string' && currentEntry.key === lastRoute.key) {
                            let prevIdx = -1;
                            for (let i = currentIdx - 1; i >= 0; i -= 1) {
                                const e = history.at(i);
                                if (e && typeof e !== 'string' && e.key === lastRoute.key) {
                                    prevIdx = i;
                                    break;
                                }
                            }

                            if (prevIdx >= 0) {
                                const prevEntry = history.at(prevIdx) as NavigationRoute<ParamListBase, string>;
                                const targetParams = prevEntry.params;
                                const routes = [...state.routes];
                                routes[state.routes.length - 1] = {
                                    ...lastRoute,
                                    params: targetParams,
                                };

                                if (lastRoute.key) {
                                    notifyPushParamsBackward(lastRoute.key, targetParams);
                                }

                                // Pop only when cursor was at the end; mid-cursor preserves so browser-forward can still reach skipped entries.
                                const cursorAtEnd = currentIdx === history.length - 1;
                                const newHistory = cursorAtEnd ? history.slice(0, -1) : history;
                                pushParamsHistoryPosition = prevIdx;

                                return {
                                    ...state,
                                    routes,
                                    history: newHistory,
                                };
                            }
                        }
                    }
                }

                // Fallback: let StackRouter pop, but preserve history entries for surviving routes so snapshots aren't wiped by getRehydratedState.
                const newState = router.getStateForAction(state, action, configOptions);
                if (!newState) {
                    return null;
                }
                return {
                    ...newState,
                    history: preserveHistoryForRoutes(state.history as CustomHistoryEntry[], newState.routes),
                };
            }

            const newState = router.getStateForAction(state, action, configOptions);

            if (!newState) {
                return null;
            }

            if (isSetParamsAction(action) && state.history) {
                return {
                    ...newState,
                    history: [...state.history],
                };
            }

            // @ts-expect-error newState may be partial, but getRehydratedState handles both partial and full states correctly.
            const rehydratedState = getRehydratedState(newState, configOptions);

            // RESET (e.g. web URL sync) would wipe PUSH_PARAMS snapshots via 1:1 rehydration — preserve entries for surviving routes.
            if (action.type === CONST.NAVIGATION.ACTION_TYPE.RESET && state.history) {
                const newFocused = rehydratedState.routes.at(-1);
                const history = state.history as CustomHistoryEntry[];
                if (newFocused?.key) {
                    const outcome = resolveCursorForReset(history, pushParamsHistoryPosition, {key: newFocused.key, params: newFocused.params});
                    if (outcome.type === 'backward') {
                        notifyPushParamsBackward(newFocused.key, newFocused.params);
                        pushParamsHistoryPosition = outcome.cursor;
                    } else if (outcome.type === 'forward') {
                        cancelPendingFocusRestore();
                        pushParamsHistoryPosition = outcome.cursor;
                    } else if (outcome.type === 'unknown') {
                        cancelPendingFocusRestore();
                    }
                    // 'noop' — pending restore and cursor left intact.
                }

                const preservedHistory = preserveHistoryForRoutes(history, rehydratedState.routes);
                if (preservedHistory.length > 0) {
                    // Remap cursor when preservation removed entries so the numeric index still points at the same logical entry.
                    if (preservedHistory.length !== history.length) {
                        const cursorEntry = pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < history.length ? history.at(pushParamsHistoryPosition) : null;
                        if (cursorEntry) {
                            const remapped = preservedHistory.indexOf(cursorEntry);
                            pushParamsHistoryPosition = remapped >= 0 ? remapped : preservedHistory.length - 1;
                        }
                    }
                    return {
                        ...rehydratedState,
                        history: preservedHistory,
                    };
                }
                // All routes removed — reset cursor so next PUSH_PARAMS starts fresh.
                pushParamsHistoryPosition = -1;
            }

            return rehydratedState;
        };

        return {
            ...router,
            getInitialState,
            getRehydratedState,
            getStateForAction,
        };
    };
}

export default addPushParamsRouterExtension;
export {resolveCursorForReset};
