import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';

import type {NavigationState} from '@react-navigation/native';

type VisibleRHPKeys = {
    visibleWideRHPRouteKeys: string[];
    visibleSuperWideRHPRouteKeys: string[];
};

const emptyRHPKeysState: VisibleRHPKeys = {
    visibleWideRHPRouteKeys: [],
    visibleSuperWideRHPRouteKeys: [],
};

/**
 * Extracts the keys of the screens that are currently displayed from the arrays of all Wide/Super Wide RHP keys.
 * Takes navigation state as an argument so the visible keys can be derived during render rather than synced by hand.
 */
function getVisibleRHPKeys(state: NavigationState | undefined, allWideRHPKeys: string[], allSuperWideRHPKeys: string[]): VisibleRHPKeys {
    // Nothing registered is the common case, and it needs no traversal of a tree whose keys nothing will be matched against.
    if (!state || (!allWideRHPKeys.length && !allSuperWideRHPKeys.length)) {
        return emptyRHPKeysState;
    }

    // Undefined once a fullscreen navigator covers the RHP, which is what makes clearing the keys by hand unnecessary.
    // A covered RHP needs no guard of its own: its screens are still in the state below, so the displayed check rejects them.
    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(state);
    const lastRHPRoute = state.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    // An RHP whose own stack has not been populated yet says nothing about its screens, so none of them is treated as displayed or as dismissing.
    if (lastRHPRoute && !lastRHPRoute.state?.routes) {
        return emptyRHPKeysState;
    }

    let visibleRHPKeys = new Set<string>();
    if (lastRHPRoute) {
        const superWideRHPIndex = lastRHPRoute.state?.routes.findLastIndex((route) => route?.key && allSuperWideRHPKeys.includes(route.key)) ?? -1;
        const wideRHPIndex = lastRHPRoute.state?.routes.findLastIndex((route) => route?.key && allWideRHPKeys.includes(route.key)) ?? -1;

        if (superWideRHPIndex > -1) {
            visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes.slice(superWideRHPIndex));
        } else if (wideRHPIndex > -1) {
            visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes.slice(wideRHPIndex));
        } else {
            visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes);
        }
    }

    // Only RHP screens register, so a registration the state no longer knows about is one animating out and holds its width until it unmounts.
    const keysInState = extractNavigationKeys(state.routes);
    const isDisplayed = (key: string) => visibleRHPKeys.has(key) || !keysInState.has(key);

    return {
        visibleWideRHPRouteKeys: allWideRHPKeys.filter(isDisplayed),
        visibleSuperWideRHPRouteKeys: allSuperWideRHPKeys.filter(isDisplayed),
    };
}

export default getVisibleRHPKeys;
