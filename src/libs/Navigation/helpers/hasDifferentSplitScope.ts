import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import getParamsFromRoute from '@libs/Navigation/helpers/getParamsFromRoute';
import {isSplitNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import type {ActionPayload} from '@libs/Navigation/helpers/linkTo/types';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import {isRecord} from '@libs/ObjectUtils';

import type {NavigationRoute} from '@navigation/types';

/**
 * Every workspace and every domain has its own split navigator instance, and they all share one route name.
 * The scope params of their screens (policyID, domainAccountID) are the only thing telling those instances
 * apart, so anything matching a route against an action payload has to compare them - otherwise workspace B's
 * split answers to a request for workspace A's.
 */

// Workspace and domain screens carry their split's scope params, so the focused screen can identify the scope
// when the sidebar is absent (narrow layouts can contain only central screens).
function getSplitScopeComparisonValues(route: NavigationRoute, payload: ActionPayload & {name?: unknown}) {
    if (!isSplitNavigatorName(route.name) || route.name !== payload.name) {
        return;
    }

    const sidebarScreen = SPLIT_TO_SIDEBAR[route.name];
    const scopeParams = getParamsFromRoute(sidebarScreen);
    // A split that is not mounted has no nested state on its route, but the state it had is preserved under its key,
    // which is how SplitRouter recovers the same information.
    const routeKey = 'key' in route ? route.key : undefined;
    const splitState = route.state ?? (routeKey ? getPreservedNavigatorState(routeKey) : undefined);
    const sidebarRoute = splitState?.routes.find((nestedRoute) => nestedRoute.name === sidebarScreen);
    // Keep an existing sidebar authoritative. Without one, the focused screen carries the scope, and with no state at
    // all the split's own params are the last thing to go on - they hold the params it was created with.
    const scopeRoute = sidebarRoute ?? splitState?.routes.at(splitState.index ?? -1);
    const currentParams: unknown = scopeRoute?.params ?? (isRecord(route.params) ? route.params.params : undefined);
    const targetParams = payload.params?.params;
    if (!scopeParams.length || !isRecord(currentParams) || !isRecord(targetParams)) {
        return;
    }

    return {scopeParams, currentParams, targetParams};
}

function getComparableScopeValue(value: unknown): string | undefined {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return;
    }

    return String(value);
}

/**
 * Whether the route is a split navigator of the same name as the payload, but holds another scope
 * (another workspace or another domain). False whenever there is nothing to compare - a split without
 * scope params, a non-split route or a payload for a different navigator.
 */
function hasDifferentSplitScope(route: NavigationRoute, payload: ActionPayload & {name?: unknown}): boolean {
    const scopeComparisonValues = getSplitScopeComparisonValues(route, payload);
    if (!scopeComparisonValues) {
        return false;
    }

    const {scopeParams, currentParams, targetParams} = scopeComparisonValues;
    return scopeParams.some((param) => {
        const currentValue = getComparableScopeValue(currentParams[param]);
        const targetValue = getComparableScopeValue(targetParams[param]);
        return currentValue !== undefined && targetValue !== undefined && currentValue !== targetValue;
    });
}

export default hasDifferentSplitScope;
