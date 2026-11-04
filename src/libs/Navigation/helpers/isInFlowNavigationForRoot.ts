import {isRecord} from '@libs/ObjectUtils';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';

type RouteToMatch = {
    name: string;
    params?: unknown;
};

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

function stateContainsRoute(state: PartialState<NavigationState>, routeToMatch: RouteToMatch, transactionID: string | undefined): boolean {
    return state.routes.some((route) => {
        if (route.name === routeToMatch.name && (transactionID === undefined || getTransactionIDFromRouteParams(route.params) === transactionID)) {
            return true;
        }

        return isNavigationStateWithRoutes(route.state) && stateContainsRoute(route.state, routeToMatch, transactionID);
    });
}

/**
 * Whether a navigation that removes the flow's first screen still keeps the user in the flow, so it shouldn't prompt:
 * - Browser back or forward after a page refresh rebuilds the whole navigation state (RESET) with new keys, so every screen looks
 *   removed, even those that stay. If the new state still has the flow's first screen for the same expense, the user is still in the flow.
 * - `Navigation.goBack(route)` replaces the current screen (REPLACE) when the route it goes back to isn't in the stack yet. Inside the
 *   flow's own stack, the user is still in the flow. For example, the header back on the confirmation of a dropped receipt opens the start page.
 */
function isInFlowNavigationForRoot(action: NavigationAction, route: RouteToMatch, ownStackKey: string | undefined): boolean {
    if (action.type === 'REPLACE') {
        return !action.target || action.target === ownStackKey;
    }

    if (action.type !== 'RESET' || !isNavigationStateWithRoutes(action.payload)) {
        return false;
    }

    return stateContainsRoute(action.payload, route, getTransactionIDFromRouteParams(route.params));
}

export default isInFlowNavigationForRoot;
