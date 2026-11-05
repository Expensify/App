import {isRecord} from '@libs/ObjectUtils';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';

type GuardedRoute = {
    name: string;
    params?: unknown;
};

/** The stack the guarded screen is in */
type GuardedStack = {
    key: string;
    index: number;
    routes: ReadonlyArray<{key: string}>;
};

const BACK_ACTION_TYPES = new Set<string>(['GO_BACK', 'POP']);

function isNavigationStateWithRoutes(state: unknown): state is PartialState<NavigationState> {
    return isRecord(state) && Array.isArray(state.routes);
}

function getTransactionIDFromRouteParams(params: unknown): string | undefined {
    if (!isRecord(params)) {
        return undefined;
    }

    if (typeof params.transactionID === 'string') {
        return params.transactionID;
    }

    // In a RESET, the params of a nested screen are under `params.params`, so look there too.
    return getTransactionIDFromRouteParams(params.params);
}

function stateContainsRoute(state: PartialState<NavigationState>, isMatch: (route: PartialState<NavigationState>['routes'][number]) => boolean): boolean {
    return state.routes.some((route) => isMatch(route) || (isNavigationStateWithRoutes(route.state) && stateContainsRoute(route.state, isMatch)));
}

/**
 * Whether a navigation that removes the guarded screen keeps the user in the flow, so it shouldn't prompt.
 *
 * Browser back or forward after a page refresh rebuilds the whole navigation state (RESET) with new keys, so every screen looks
 * removed, even those that stay. If the new state still has the guarded screen for the same expense, nothing is lost. For example,
 * after a refresh on Category, browser back opens Confirmation again.
 *
 * With `canGoBack`, going back to an earlier screen of the same expense with the RHP still open doesn't prompt either. That's a back
 * that the guarded screen's own stack handles, such as the header back, Android back or an iOS swipe, or a browser back to
 * another screen of the expense. Closing the RHP still prompts.
 */
function isNavigationInsideFlow(action: NavigationAction, route: GuardedRoute, stack: GuardedStack | undefined, canGoBack: boolean): boolean {
    const transactionID = getTransactionIDFromRouteParams(route.params);

    if (action.type === 'RESET') {
        if (!isNavigationStateWithRoutes(action.payload)) {
            return false;
        }
        if (canGoBack && transactionID !== undefined) {
            return stateContainsRoute(action.payload, (stateRoute) => getTransactionIDFromRouteParams(stateRoute.params) === transactionID);
        }
        return stateContainsRoute(
            action.payload,
            (stateRoute) => stateRoute.name === route.name && (transactionID === undefined || getTransactionIDFromRouteParams(stateRoute.params) === transactionID),
        );
    }

    if (!canGoBack || !stack) {
        return false;
    }

    if (action.target) {
        return action.target === stack.key;
    }

    // Without a target, the focused screen's stack handles a back. It doesn't when there's no earlier screen in the stack, or when a
    // screen outside the stack sent it, such as clicking outside the RHP.
    return BACK_ACTION_TYPES.has(action.type) && stack.index > 0 && (!action.source || stack.routes.some((stackRoute) => stackRoute.key === action.source));
}

export default isNavigationInsideFlow;
