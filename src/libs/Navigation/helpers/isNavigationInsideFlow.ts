/**
 * Tells whether a navigation that removes the first screen of a flow still keeps the user in the flow, so the "Discard changes?"
 * prompt shouldn't ask.
 */
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';

type GuardedRoute = {
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

function doesStateContainRoute(state: PartialState<NavigationState>, routeToMatch: GuardedRoute, transactionID: string | undefined): boolean {
    return state.routes.some(
        (route) =>
            (route.name === routeToMatch.name && (transactionID === undefined || getTransactionIDFromRouteParams(route.params) === transactionID)) ||
            (isNavigationStateWithRoutes(route.state) && doesStateContainRoute(route.state, routeToMatch, transactionID)),
    );
}

/**
 * Whether a navigation that removes the flow's first screen keeps the user in the flow, so it shouldn't prompt. Browser back or
 * forward after a page refresh rebuilds the whole navigation state (RESET) with new keys, so every screen looks removed, even those
 * that stay. If the new state still has the flow's first screen for the same expense, the user is still in the flow.
 */
function isNavigationInsideFlow(action: NavigationAction, route: GuardedRoute): boolean {
    if (action.type !== CONST.NAVIGATION.ACTION_TYPE.RESET || !isNavigationStateWithRoutes(action.payload)) {
        return false;
    }

    return doesStateContainRoute(action.payload, route, getTransactionIDFromRouteParams(route.params));
}

export default isNavigationInsideFlow;
