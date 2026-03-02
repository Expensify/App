import {CommonActions} from '@react-navigation/native';
import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType} from '@react-navigation/native';
import type {PlatformStackNavigationState, PlatformStackRouterFactory, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {GoBackAction, SetParamsAction} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type {CustomHistoryEntry, HistoryStackNavigatorAction, PushParamsActionType} from './types';

function preserveHistoryForRoutes(oldHistory: CustomHistoryEntry[], routes: Array<{key?: string}>): CustomHistoryEntry[] {
    const remainingKeys = new Set(routes.map((r) => r.key));
    return oldHistory.filter((entry) => typeof entry === 'string' || remainingKeys.has(entry.key));
}

function isSetParamsAction(action: HistoryStackNavigatorAction): action is SetParamsAction {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS;
}

function isPushParamsAction(action: HistoryStackNavigatorAction): action is PushParamsActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS;
}

function isGoBackAction(action: HistoryStackNavigatorAction): action is GoBackAction {
    return action.type === 'GO_BACK';
}

function isPopAction(action: HistoryStackNavigatorAction): boolean {
    return action.type === 'POP';
}

/**
 * Higher-order function that extends the React Navigation stack router with custom history functionality.
 * It maintains a separate history stack of route snapshots that can diverge from the routes array,
 * enabling back-navigation through param changes (via PUSH_PARAMS) without requiring additional routes.
 *
 * TODO: Remove this custom history extension after upgrading to React Navigation 8,
 * which has built-in support for a PUSH_PARAMS-like action.
 *
 * NOTE: The PUSH_PARAMS approach is heuristic and only works in the current setup for the
 * SearchFullscreenNavigator. It may break if new screens are added to that navigator or if
 * other structural changes are made to the navigation hierarchy.
 *
 * @param originalRouter - The original stack router function to be extended
 * @returns Enhanced router with custom history functionality
 */

function addCustomHistoryRouterExtension<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    originalRouter: PlatformStackRouterFactory<ParamListBase, RouterOptions>,
) {
    return (options: RouterOptions): Router<PlatformStackNavigationState<ParamListBase>, HistoryStackNavigatorAction> => {
        const router = originalRouter(options);

        const enhanceStateWithHistory = (state: PlatformStackNavigationState<ParamListBase>) => {
            return {
                ...state,
                history: state.routes.map((route) => ({...route})) as CustomHistoryEntry[],
            };
        };

        // Override router methods to attach a history array (route snapshots) alongside routes.
        const getInitialState = (configOptions: RouterConfigOptions) => {
            const state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };

        const getRehydratedState = (partialState: PartialState<PlatformStackNavigationState<ParamListBase>>, configOptions: RouterConfigOptions) => {
            const state = router.getRehydratedState(partialState, configOptions);
            const stateWithInitialHistory = enhanceStateWithHistory(state);

            // Preserve the side panel custom history entry if it was present in the partial state.
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
            if (isPushParamsAction(action)) {
                const setParamsAction = CommonActions.setParams(action.payload.params);
                const stateWithUpdatedParams = router.getStateForAction(state, setParamsAction, configOptions);

                if (!stateWithUpdatedParams?.history) {
                    return stateWithUpdatedParams;
                }

                const lastRoute = stateWithUpdatedParams.routes.at(-1);

                if (lastRoute) {
                    return {...stateWithUpdatedParams, history: [...stateWithUpdatedParams.history, lastRoute]};
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
                    const lastTwo = routeHistoryEntries.slice(-2);

                    // Only revert params when the last two history snapshots share the same route key,
                    // meaning they are consecutive PUSH_PARAMS snapshots of the same screen. If the
                    // keys differ, a different screen sits on top (e.g. Search{q=A} -> Search{q=B} -> OtherPage)
                    // and standard POP should remove that screen instead.
                    if (lastTwo.length === 2 && lastTwo.at(0)?.key === lastTwo.at(1)?.key) {
                        const newHistory = [...state.history];
                        newHistory.pop();

                        const lastRoute = state.routes.at(-1);
                        if (lastRoute) {
                            const routes = [...state.routes];
                            routes[state.routes.length - 1] = {
                                ...lastRoute,
                                params: lastTwo.at(0)?.params,
                            };

                            return {
                                ...state,
                                routes,
                                history: newHistory,
                            };
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

            // Action was not handled by the underlying router.
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

            // RESET actions (fired by web URL sync after PUSH_PARAMS changes the URL) would
            // normally rebuild history 1:1 from routes via getRehydratedState, wiping all
            // PUSH_PARAMS snapshots. Preserve history entries for routes that still exist.
            if (action.type === 'RESET' && state.history) {
                const preservedHistory = preserveHistoryForRoutes(state.history as CustomHistoryEntry[], newState.routes);
                if (preservedHistory.length > 0) {
                    return {
                        ...newState,
                        history: preservedHistory,
                    };
                }
            }

            // For all other actions, rebuild history from the updated routes.
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

export default addCustomHistoryRouterExtension;
