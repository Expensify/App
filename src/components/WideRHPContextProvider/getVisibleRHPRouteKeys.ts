import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';

import type {NavigationState} from '@react-navigation/native';

type VisibleRHPKeys = {
    visibleWideRHPRouteKeys: string[];
    visibleSuperWideRHPRouteKeys: string[];
    presentRouteKeys: string[];
};

const emptyRHPKeysState: VisibleRHPKeys = {
    visibleWideRHPRouteKeys: [],
    visibleSuperWideRHPRouteKeys: [],
    presentRouteKeys: [],
};

/**
 * A key missing from the navigation state may be a screen dismissing or one that was never shown, and only the first
 * holds a width. Callers must record `presentRouteKeys` so `seenRouteKeys` can tell those apart.
 */
function getVisibleRHPKeys(state: NavigationState | undefined, allWideRHPKeys: string[], allSuperWideRHPKeys: string[], seenRouteKeys: ReadonlySet<string>): VisibleRHPKeys {
    // Nothing registered is the common case, and there is then no key to match the tree against.
    if (!state || (!allWideRHPKeys.length && !allSuperWideRHPKeys.length)) {
        return emptyRHPKeysState;
    }

    // A covered RHP needs no hand-clearing: this returns undefined for it, and its keys are still in the state below, so the displayed check rejects them too.
    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(state);
    const lastRHPRoute = state.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    let visibleRHPKeys = new Set<string>();
    if (lastRHPRoute?.state?.routes) {
        const superWideRHPIndex = lastRHPRoute.state.routes.findLastIndex((route) => route?.key && allSuperWideRHPKeys.includes(route.key));
        const wideRHPIndex = lastRHPRoute.state.routes.findLastIndex((route) => route?.key && allWideRHPKeys.includes(route.key));

        if (superWideRHPIndex > -1) {
            visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state.routes.slice(superWideRHPIndex));
        } else if (wideRHPIndex > -1) {
            visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state.routes.slice(wideRHPIndex));
        } else {
            visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state.routes);
        }
    }

    const keysInState = extractNavigationKeys(state.routes);
    const isDisplayed = (key: string) => visibleRHPKeys.has(key) || (seenRouteKeys.has(key) && !keysInState.has(key));

    return {
        visibleWideRHPRouteKeys: allWideRHPKeys.filter(isDisplayed),
        visibleSuperWideRHPRouteKeys: allSuperWideRHPKeys.filter(isDisplayed),
        presentRouteKeys: [...allWideRHPKeys, ...allSuperWideRHPKeys].filter((key) => keysInState.has(key)),
    };
}

export default getVisibleRHPKeys;
