import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';
import {navigationRef} from '@libs/Navigation/Navigation';

type VisibleRHPKeys = {
    visibleWideRHPRouteKeys: string[];
    visibleSuperWideRHPRouteKeys: string[];
};

const emptyRHPKeysState: VisibleRHPKeys = {
    visibleWideRHPRouteKeys: [],
    visibleSuperWideRHPRouteKeys: [],
};

/**
 * Extracts the keys of the screens that are currently displayed from the array of all Wide/Super Wide RHP keys
 *
 * @param allWideRHPKeys - an array of all Wide/Super Wide RHP keys
 */
function getVisibleRHPKeys(allSuperWideRHPKeys: string[], allWideRHPKeys: string[]): VisibleRHPKeys {
    if (!navigationRef.isReady()) {
        return emptyRHPKeysState;
    }

    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return emptyRHPKeysState;
    }

    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(rootState);
    const lastRHPRoute = rootState.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    if (!lastRHPRoute) {
        return emptyRHPKeysState;
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
