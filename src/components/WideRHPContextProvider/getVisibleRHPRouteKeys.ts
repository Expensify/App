import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';
import {navigationRef} from '@libs/Navigation/Navigation';
import SCREENS from '@src/SCREENS';

/**
 * Extracts the keys of the screens that are currently displayed from the array of all Wide/Super Wide RHP keys
 *
 * @param allWideRHPKeys - an array of all Wide/Super Wide RHP keys
 */
function getVisibleWideRHPKeys(allWideRHPKeys: string[]) {
    const rootState = navigationRef.getRootState();

    if (!rootState) {
        return [];
    }

    const lastVisibleRHPRouteKey = getLastVisibleRHPRouteKey(rootState);
    const lastRHPRoute = rootState.routes.find((route) => route.key === lastVisibleRHPRouteKey);

    if (!lastRHPRoute) {
        return [];
    }

    const superWideRHPIndex =
        lastRHPRoute.state?.routes.findLastIndex((route) => route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || route.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT) ?? -1;

    const wideRHPIndex = lastRHPRoute.state?.routes.findLastIndex((route) => route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT) ?? -1;

    let lastRHPKeys;
    if (superWideRHPIndex > -1) {
        lastRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes.slice(superWideRHPIndex));
    } else if (wideRHPIndex > -1) {
        lastRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes.slice(wideRHPIndex));
    } else {
        lastRHPKeys = extractNavigationKeys(lastRHPRoute.state?.routes);
    }

    const currentKeys = allWideRHPKeys.filter((key) => lastRHPKeys.has(key));

    return currentKeys;
}

export default getVisibleWideRHPKeys;
