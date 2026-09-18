import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import {isRecord} from '@libs/ObjectUtils';

import type {NavigationRoute} from '@navigation/types';

import type {ActionPayload} from './linkTo/types';

import getParamsFromRoute from './getParamsFromRoute';
import {isSplitNavigatorName} from './isNavigatorName';

function getSplitScopeComparisonValues(route: NavigationRoute, payload: ActionPayload & {name?: string}) {
    if (!isSplitNavigatorName(route.name) || route.name !== payload.name) {
        return;
    }

    const sidebarScreen = SPLIT_TO_SIDEBAR[route.name];
    // Nothing to compare is a property of the split, not of the state, so this is answered before reading any.
    const scopeParams = getParamsFromRoute(sidebarScreen);
    if (!scopeParams.length) {
        return;
    }

    // An unmounted split has no nested state on its route, but its last state is preserved under its key.
    const routeKey = 'key' in route ? route.key : undefined;
    const splitState = route.state ?? (routeKey ? getPreservedNavigatorState(routeKey) : undefined);
    const sidebarRoute = splitState?.routes.find((nestedRoute) => nestedRoute.name === sidebarScreen);
    // Sidebar wins. Without one the focused screen carries the scope (narrow splits can hold central screens only),
    // and with no state at all the split's own creation params are the last resort.
    const scopeRoute = sidebarRoute ?? splitState?.routes.at(splitState.index ?? -1);
    // `getActionFromState` always nests a split's screen params under `params.params`, which is why both sides read
    // one level down. A payload that ever carried the scope higher up would compare as the same scope.
    const currentParams: unknown = scopeRoute?.params ?? (isRecord(route.params) ? route.params.params : undefined);
    const targetParams = payload.params?.params;
    if (!isRecord(currentParams) || !isRecord(targetParams)) {
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
function hasDifferentSplitScope(route: NavigationRoute, payload: ActionPayload & {name?: string}): boolean {
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
