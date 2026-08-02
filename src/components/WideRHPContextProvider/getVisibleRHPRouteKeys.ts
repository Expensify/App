import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';

import NAVIGATORS from '@src/NAVIGATORS';

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
    if (!state) {
        return emptyRHPKeysState;
    }

    // Undefined once a fullscreen navigator covers the RHP, which is what makes clearing the keys by hand unnecessary.
    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(state);
    const lastRHPRoute = state.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    if (!lastRHPRoute) {
        if (state.routes.some((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)) {
            return emptyRHPKeysState;
        }
        // A dismissing RHP leaves the navigation state while its card animates out, so its registrations, which live until unmount, hold the width.
        return {visibleWideRHPRouteKeys: allWideRHPKeys, visibleSuperWideRHPRouteKeys: allSuperWideRHPKeys};
    }

    const superWideRHPIndex = lastRHPRoute.state?.routes.findLastIndex((route) => route?.key && allSuperWideRHPKeys.includes(route.key)) ?? -1;
    const wideRHPIndex = lastRHPRoute.state?.routes.findLastIndex((route) => route?.key && allWideRHPKeys.includes(route.key)) ?? -1;

    let visibleRHPKeys;
    if (superWideRHPIndex > -1) {
        visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes.slice(superWideRHPIndex));
    } else if (wideRHPIndex > -1) {
        visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes.slice(wideRHPIndex));
    } else {
        visibleRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes);
    }

    return {
        visibleWideRHPRouteKeys: allWideRHPKeys.filter((key) => visibleRHPKeys.has(key)),
        visibleSuperWideRHPRouteKeys: allSuperWideRHPKeys.filter((key) => visibleRHPKeys.has(key)),
    };
}

export default getVisibleRHPKeys;
