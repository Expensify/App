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
        // Cursor into PUSH_PARAMS history — lastIndex is ambiguous for duplicate compounds (A → B → A). Per-router so tests instantiating multiple routers stay isolated.
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
                // Capture the trigger against the outgoing (pre-update) params so a future GO_BACK can restore focus to it.
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
                    // Mirror browser history: pushing while not at the end discards forward entries.
                    const existingHistory = stateWithUpdatedParams.history;
                    const baseHistory =
                        pushParamsHistoryPosition >= 0 && pushParamsHistoryPosition < existingHistory.length - 1 ? existingHistory.slice(0, pushParamsHistoryPosition + 1) : existingHistory;
                    const newHistory = [...baseHistory, lastRoute];
                    pushParamsHistoryPosition = newHistory.length - 1;
                    return {...stateWithUpdatedParams, history: newHistory};
                }

                return stateWithUpdatedParams;
            }

            // On native there is no browser history, so GO_BACK/POP operate on state.routes which
            // PUSH_PARAMS never grew. Without this intercept the StackRouter would either pop the
            // entire screen (if routes.length > 1) or return null and bubble the action up to the
            // parent navigator. Instead, we consume the action here by reverting params to the
            // previous history snapshot — mirroring what the browser does on web via popstate.
            if ((isGoBackAction(action) || isPopAction(action)) && state.history) {
                const routeHistoryEntries = state.history.filter((entry): entry is NavigationRoute<ParamListBase, string> => typeof entry !== 'string');

                if (routeHistoryEntries.length > state.routes.length) {
                    const lastRoute = state.routes.at(-1);
                    if (lastRoute) {
                        // Cursor-relative, not last-two: mid-cursor GO_BACK (web, after a browser-back RESET) would otherwise leave cursor and state out of sync.
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

                // Keys didn't match or no surplus for the focused route — let the StackRouter
                // handle the pop normally, but preserve history entries for routes that survive
                // so PUSH_PARAMS snapshots aren't wiped by getRehydratedState.
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

            // SET_PARAMS should not alter the history stack — keep the existing history as-is.
            if (isSetParamsAction(action) && state.history) {
                return {
                    ...newState,
                    history: [...state.history],
                };
            }

            // For all other actions, rebuild history from the updated routes.
            // @ts-expect-error newState may be partial, but getRehydratedState handles both partial and full states correctly.
            const rehydratedState = getRehydratedState(newState, configOptions);

            // RESET actions (fired by web URL sync after PUSH_PARAMS changes the URL) would
            // normally rebuild history 1:1 from routes via getRehydratedState, wiping all
            // PUSH_PARAMS snapshots. Preserve history entries for routes that still exist
            // in the rehydrated state (which may have added routes, e.g. for wide layout).
            if (action.type === CONST.NAVIGATION.ACTION_TYPE.RESET && state.history) {
                // RESET handles popstate. Only entries at position±1 are adjacent browser nav; non-adjacent jumps are forward URL nav (skip).
                const newFocused = rehydratedState.routes.at(-1);
                if (newFocused?.key) {
                    const history = state.history as CustomHistoryEntry[];
                    // Reinitialize when out of range — module-scoped cursor can survive history-shrinking events.
                    if (pushParamsHistoryPosition < 0 || pushParamsHistoryPosition >= history.length) {
                        pushParamsHistoryPosition = history.length - 1;
                    }
                    const newCompound = compoundParamsKey(newFocused.key, newFocused.params);
                    const matchAt = (idx: number) => {
                        if (idx < 0 || idx >= history.length) {
                            return false;
                        }
                        const entry = history.at(idx);
                        if (typeof entry === 'string' || !entry || entry.key !== newFocused.key) {
                            return false;
                        }
                        return compoundParamsKey(entry.key, entry.params) === newCompound;
                    };
                    if (matchAt(pushParamsHistoryPosition - 1)) {
                        notifyPushParamsBackward(newFocused.key, newFocused.params);
                        pushParamsHistoryPosition -= 1;
                    } else if (matchAt(pushParamsHistoryPosition + 1)) {
                        // Browser-forward: cancel any pending backward restore — handleStateChange classifies same-key transitions as noop.
                        cancelPendingFocusRestore();
                        pushParamsHistoryPosition += 1;
                    }
                }

                const preservedHistory = preserveHistoryForRoutes(state.history as CustomHistoryEntry[], rehydratedState.routes);
                if (preservedHistory.length > 0) {
                    return {
                        ...rehydratedState,
                        history: preservedHistory,
                    };
                }
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
