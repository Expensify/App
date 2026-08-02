import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';

import type {NavigationState} from '@react-navigation/native';

type VisibleRHPKeys = {
    visibleWideRHPRouteKeys: string[];
    visibleSuperWideRHPRouteKeys: string[];
};

const EMPTY_ROUTE_KEYS: string[] = [];

const emptyRHPKeysState: VisibleRHPKeys = {
    visibleWideRHPRouteKeys: EMPTY_ROUTE_KEYS,
    visibleSuperWideRHPRouteKeys: EMPTY_ROUTE_KEYS,
};

/**
 * Ordered child route keys of the RHP currently on screen, empty when a fullscreen navigator covers it.
 * A pure snapshot of navigation state, so the visible keys can be derived during render instead of synced by hand.
 */
function getVisibleRHPChildRouteKeys(state: NavigationState | undefined): string[] {
    if (!state) {
        return EMPTY_ROUTE_KEYS;
    }

    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(state);
    if (!lastVisibleRHPRouteKey) {
        return EMPTY_ROUTE_KEYS;
    }

    const lastRHPRoute = state.routes.find((route) => route.key === lastVisibleRHPRouteKey);
    if (!lastRHPRoute?.state?.routes) {
        return EMPTY_ROUTE_KEYS;
    }

    return [...extractNavigationKeys(lastRHPRoute.state.routes)];
}

/** Of the screens stacked in the visible RHP, only those from the widest one upwards are displayed at that width. */
function selectVisibleRHPKeys(visibleRHPChildRouteKeys: string[], allWideRHPRouteKeys: string[], allSuperWideRHPRouteKeys: string[]): VisibleRHPKeys {
    if (!visibleRHPChildRouteKeys.length) {
        return emptyRHPKeysState;
    }

    const superWideRHPIndex = visibleRHPChildRouteKeys.findLastIndex((key) => allSuperWideRHPRouteKeys.includes(key));
    const wideRHPIndex = visibleRHPChildRouteKeys.findLastIndex((key) => allWideRHPRouteKeys.includes(key));

    let widestIndex = 0;
    if (superWideRHPIndex > -1) {
        widestIndex = superWideRHPIndex;
    } else if (wideRHPIndex > -1) {
        widestIndex = wideRHPIndex;
    }
    const visibleKeys = new Set(visibleRHPChildRouteKeys.slice(widestIndex));

    return {
        visibleWideRHPRouteKeys: allWideRHPRouteKeys.filter((key) => visibleKeys.has(key)),
        visibleSuperWideRHPRouteKeys: allSuperWideRHPRouteKeys.filter((key) => visibleKeys.has(key)),
    };
}

export {getVisibleRHPChildRouteKeys, selectVisibleRHPKeys};
