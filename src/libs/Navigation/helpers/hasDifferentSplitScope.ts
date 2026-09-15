import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import getParamsFromRoute from '@libs/Navigation/helpers/getParamsFromRoute';
import {isSplitNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import type {ActionPayload} from '@libs/Navigation/helpers/linkTo/types';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import {isRecord} from '@libs/ObjectUtils';

import type {NavigationRoute} from '@navigation/types';

function getSplitScopeComparisonValues(route: NavigationRoute, payload: ActionPayload & {name?: unknown}) {
    if (!isSplitNavigatorName(route.name) || route.name !== payload.name) {
        return;
    }

    const sidebarScreen = SPLIT_TO_SIDEBAR[route.name];
    const scopeParams = getParamsFromRoute(sidebarScreen);
    // An unmounted split has no nested state on its route, but its last state is preserved under its key.
    const routeKey = 'key' in route ? route.key : undefined;
    const splitState = route.state ?? (routeKey ? getPreservedNavigatorState(routeKey) : undefined);
    const sidebarRoute = splitState?.routes.find((nestedRoute) => nestedRoute.name === sidebarScreen);
    // Sidebar wins. Without one the focused screen carries the scope (narrow splits can hold central screens only),
    // and with no state at all the split's own creation params are the last resort.
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
 * Whether the route is a split navigator with the payload's name but another scope. Workspace and domain splits all
 * share one route name, so only the scope params of their sidebar (policyID, domainAccountID) tell the instances apart.
 * False when there is nothing to compare: no scope params, a non-split route, or a payload for another navigator.
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
