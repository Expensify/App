import {CommonActions} from '@react-navigation/native';
import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import compoundParamsKey from '@libs/compoundParamsKey';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {GoBackAction, SetParamsAction} from '@libs/Navigation/types';
import {cancelPendingFocusRestore, notifyPushParamsBackward, notifyPushParamsForward} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';
import type {CustomHistoryEntry, PushParamsActionType, PushParamsRouterAction} from './types';
import {enhanceStateWithHistory} from './utils';

function preserveHistoryForRoutes(oldHistory: CustomHistoryEntry[], routes: Array<{key?: string}>): CustomHistoryEntry[] {
    const remainingKeys = new Set(routes.map((r) => r.key));
    return oldHistory.filter((entry) => typeof entry === 'string' || remainingKeys.has(entry.key));
}

// noop=match at cursor; backward/forward=move cursor to match; ambiguous=same compound at cursor±1 (see ambiguous branch); unknown=target not in history.
type ResetOutcome = {type: 'noop'; cursor: number} | {type: 'backward'; cursor: number} | {type: 'forward'; cursor: number} | {type: 'ambiguous'; cursor: number} | {type: 'unknown'};

/**
 * Classifies a RESET's target against our PUSH_PARAMS history + cursor so the caller fires the right focus-return notification and updates the cursor.
 * Without the 'noop' branch, `useNavigationResetOnLayoutChange`'s reflexive `reset(getState())` on window resize would be treated as a real navigation — cancelling any pending Esc-triggered focus restore so focus never returns to the trigger.
 */
function resolveCursorForReset(history: CustomHistoryEntry[], currentCursor: number, newFocused: {key: string; params: unknown}): ResetOutcome {
    const inRange = currentCursor >= 0 && currentCursor < history.length;
    // Snapped cursor drives direction inference only; adjacent probes are gated on inRange.
    const cursor = inRange ? currentCursor : history.length - 1;
    const newCompound = compoundParamsKey(newFocused.key, newFocused.params);

    const matchAt = (index: number): boolean => {
        if (index < 0 || index >= history.length) {
            return false;
        }
        const entry = history.at(index);
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
        const forwardMatches = matchAt(cursor + 1);
        const backwardMatches = matchAt(cursor - 1);
        if (forwardMatches && backwardMatches) {
            // Direction unknowable from state — cursor forward (keeps goBack alive), caller fires backward notify (WCAG 2.4.3).
            return {type: 'ambiguous', cursor: cursor + 1};
        }
        if (forwardMatches) {
            return {type: 'forward', cursor: cursor + 1};
        }
        if (backwardMatches) {
            return {type: 'backward', cursor: cursor - 1};
        }
    }
    // Non-adjacent jump or out-of-range cursor: scan for the NEAREST match to cursor. Forward wins on distance ties.
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (let index = 0; index < history.length; index += 1) {
        if (!matchAt(index)) {
            continue;
        }
        const distance = Math.abs(index - cursor);
        if (distance < bestDistance || (distance === bestDistance && index > cursor)) {
            bestIndex = index;
            bestDistance = distance;
        }
    }
    if (bestIndex === -1) {
        return {type: 'unknown'};
    }
    return bestIndex < cursor ? {type: 'backward', cursor: bestIndex} : {type: 'forward', cursor: bestIndex};
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

        // Without seeding, the first reflexive RESET before any PUSH_PARAMS hits inRange=false and is classified as 'forward', cancelling pending Esc-triggered restores.
        const seedCursor = (state: ReturnType<typeof enhanceStateWithHistory>) => {
            if (pushParamsHistoryPosition < 0 && state?.history?.length) {
                pushParamsHistoryPosition = state.history.length - 1;
            }
            return state;
        };

        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return seedCursor(enhanceStateWithHistory(state));
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            return seedCursor(enhanceStateWithHistory(state));
        };

        const getStateForAction = (
            state: PlatformStackNavigationState<ParamListBase>,
            action: CommonActions.Action | StackActionType | PushParamsRouterAction,
            configOptions: RouterConfigOptions,
        ) => {
            if (isPushParamsAction(action)) {
                const setParamsAction = CommonActions.setParams(action.payload.params);
                const stateWithUpdatedParams = router.getStateForAction(state, setParamsAction, configOptions);

                if (!stateWithUpdatedParams?.history) {
                    // Skip capture — the update didn't commit usable history, so any captured trigger would be orphan.
                    return stateWithUpdatedParams;
                }

                // setParams targets routes[state.index]; capture must follow or GO_BACK's compound-key lookup misses when focus is non-terminal (post-RESET).
                const outgoingRoute = state.routes.at(state.index) ?? state.routes.at(-1);
                if (outgoingRoute?.key) {
                    notifyPushParamsForward(outgoingRoute.key, outgoingRoute.params);
                }

                // `index` is typed optional on partial state — at(-1) fallback recovers the last route.
                const focusedRoute = stateWithUpdatedParams.routes.at(stateWithUpdatedParams.index ?? -1) ?? stateWithUpdatedParams.routes.at(-1);

                if (focusedRoute) {
                    // Mirror window.history.pushState: pushing mid-cursor discards forward entries.
                    const existingHistory = stateWithUpdatedParams.history;
                    const baseHistory =
                        pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < existingHistory.length - 1 ? existingHistory.slice(0, pushParamsHistoryPosition + 1) : existingHistory;
                    // No FIFO cap — useLinking decides push/replace by history.length delta; a fixed cap forces replaceState past the bound.
                    const newHistory = [...baseHistory, focusedRoute];
                    pushParamsHistoryPosition = newHistory.length - 1;
                    return {...stateWithUpdatedParams, history: newHistory};
                }

                return stateWithUpdatedParams;
            }

            // No browser history on native — intercept GO_BACK/POP to revert params to the prior snapshot (what the browser does via popstate on web).
            if ((isGoBackAction(action) || isPopAction(action)) && state.history) {
                const routeHistoryEntries = state.history.filter((entry): entry is NavigationRoute<ParamListBase, string> => typeof entry !== 'string');

                if (routeHistoryEntries.length > state.routes.length) {
                    // Index-based, not at(-1) — must match the key PUSH_PARAMS captured under.
                    const focusedRoute = state.routes.at(state.index) ?? state.routes.at(-1);
                    if (focusedRoute) {
                        // Cursor-relative, not last-two: last-two drifts out of sync after a mid-cursor browser-back RESET.
                        const history = state.history as CustomHistoryEntry[];
                        const currentIdx = pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < history.length ? pushParamsHistoryPosition : history.length - 1;
                        const currentEntry = history.at(currentIdx);

                        if (currentEntry && typeof currentEntry !== 'string' && currentEntry.key === focusedRoute.key) {
                            let prevIdx = -1;
                            for (let i = currentIdx - 1; i >= 0; i -= 1) {
                                const e = history.at(i);
                                if (e && typeof e !== 'string' && e.key === focusedRoute.key) {
                                    prevIdx = i;
                                    break;
                                }
                            }

                            if (prevIdx >= 0) {
                                const prevEntry = history.at(prevIdx) as NavigationRoute<ParamListBase, string>;
                                const targetParams = prevEntry.params;
                                const routes = [...state.routes];
                                routes[state.index] = {
                                    ...focusedRoute,
                                    params: targetParams,
                                };

                                if (focusedRoute.key) {
                                    notifyPushParamsBackward(focusedRoute.key, targetParams);
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
                const preservedHistory = preserveHistoryForRoutes(state.history as CustomHistoryEntry[], newState.routes);
                // Sync cursor to the focused entry of the filtered history — same invariant as the fall-through path.
                pushParamsHistoryPosition = preservedHistory.length > 0 ? preservedHistory.length - 1 : -1;
                return {
                    ...newState,
                    history: preservedHistory,
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
                // CommonActions.reset can install any index — pick the focused route, not routes.at(-1).
                const newFocused = rehydratedState.routes.at(rehydratedState.index) ?? rehydratedState.routes.at(-1);
                const history = state.history as CustomHistoryEntry[];
                if (newFocused?.key) {
                    const outcome = resolveCursorForReset(history, pushParamsHistoryPosition, {key: newFocused.key, params: newFocused.params});
                    if (outcome.type === 'backward' || outcome.type === 'ambiguous') {
                        // Ambiguous: cursor goes forward (per resolver) but we fire backward notify (WCAG 2.4.3 priority on direction-uncertain RESETs).
                        notifyPushParamsBackward(newFocused.key, newFocused.params);
                        pushParamsHistoryPosition = outcome.cursor;
                    } else if (outcome.type === 'forward') {
                        cancelPendingFocusRestore();
                        pushParamsHistoryPosition = outcome.cursor;
                    } else if (outcome.type === 'unknown') {
                        cancelPendingFocusRestore();
                        // Replace cursor entry to preserve history.length — useLinking interprets a shrink as goBack(delta), so a SET_PARAMS-then-layout-change-RESET would otherwise send the browser back N entries.
                        const preservedHistory = preserveHistoryForRoutes(history, rehydratedState.routes);
                        if (preservedHistory.length === 0) {
                            pushParamsHistoryPosition = 0;
                            return {...rehydratedState, history: [newFocused]};
                        }
                        // preserveHistoryForRoutes returns the same references, so indexOf remaps the cursor.
                        const cursorEntry = pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < history.length ? history.at(pushParamsHistoryPosition) : null;
                        const remappedCursor = cursorEntry ? preservedHistory.indexOf(cursorEntry) : -1;
                        const cursorIdx = remappedCursor >= 0 ? remappedCursor : preservedHistory.length - 1;
                        const updatedHistory = [...preservedHistory];
                        updatedHistory[cursorIdx] = newFocused;
                        pushParamsHistoryPosition = cursorIdx;
                        return {...rehydratedState, history: updatedHistory};
                    }
                    // 'noop' — pending restore and cursor left intact.
                }

                const preservedHistory = preserveHistoryForRoutes(history, rehydratedState.routes);
                if (preservedHistory.length > 0) {
                    // Remap cursor when preservation removed entries — same logical entry, new index. `indexOf` reference-equality assumes `preserveHistoryForRoutes` doesn't clone; if it ever does, remap falls back to length-1.
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
            }

            // Sync cursor to the new focused entry — otherwise a prior mid-cursor position leaks into the rebuilt history and truncates valid entries on the next PUSH_PARAMS.
            pushParamsHistoryPosition = rehydratedState.history?.length ? rehydratedState.history.length - 1 : -1;
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
