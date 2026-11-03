import extractNavigationKeys from '@libs/Navigation/helpers/extractNavigationKeys';
import getLastVisibleRHPRouteKey from '@libs/Navigation/helpers/getLastVisibleRHPRouteKey';

import type {NavigationState} from '@react-navigation/native';

type VisibleRHPKeys = {
    /** Keys the frame must still be as wide as, including a screen animating out. */
    widthWideRHPRouteKeys: string[];
    widthSuperWideRHPRouteKeys: string[];

    /** Keys still in the navigation state. Overlays and Escape use these, since a leaving screen is below nothing. */
    displayedWideRHPRouteKeys: string[];
    displayedSuperWideRHPRouteKeys: string[];

    /** Each registered key in the state with its RHP, so a width hold ends when that RHP leaves the screen. */
    presentRouteEntries: Array<[string, string]>;
};

const emptyRHPKeysState: VisibleRHPKeys = {
    widthWideRHPRouteKeys: [],
    widthSuperWideRHPRouteKeys: [],
    displayedWideRHPRouteKeys: [],
    displayedSuperWideRHPRouteKeys: [],
    presentRouteEntries: [],
};

/**
 * Separates the screens on display from those the frame is still sized for, which also include one animating out. Only a key
 * seen in the state can be dismissing, so callers record `presentRouteEntries` into `seenRouteKeys`.
 */
function getVisibleRHPKeys(state: NavigationState | undefined, allWideRHPKeys: string[], allSuperWideRHPKeys: string[], seenRouteKeys: ReadonlyMap<string, string>): VisibleRHPKeys {
    if (!state || (!allWideRHPKeys.length && !allSuperWideRHPKeys.length)) {
        return emptyRHPKeysState;
    }

    // Undefined for an RHP covered by a fullscreen navigator, so none of its keys count as displayed.
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

    const rootRouteKeyByKey = new Map<string, string>();
    for (const route of state.routes) {
        for (const key of extractNavigationKeys([route])) {
            rootRouteKeyByKey.set(key, route.key);
        }
    }
    const isDisplayed = (key: string) => visibleRHPKeys.has(key);
    // A screen that left the state keeps its width until its own RHP stops being the one on screen.
    const isDismissingFromTheRHPOnScreen = (key: string) => {
        const seenInRHPRouteKey = seenRouteKeys.get(key);
        if (seenInRHPRouteKey === undefined || rootRouteKeyByKey.has(key)) {
            return false;
        }
        return lastVisibleRHPRouteKey === undefined || lastVisibleRHPRouteKey === seenInRHPRouteKey;
    };
    const hasWidth = (key: string) => isDisplayed(key) || isDismissingFromTheRHPOnScreen(key);

    const presentRouteEntries: Array<[string, string]> = [];
    for (const key of [...allWideRHPKeys, ...allSuperWideRHPKeys]) {
        const rhpRouteKey = rootRouteKeyByKey.get(key);
        if (!rhpRouteKey) {
            continue;
        }
        presentRouteEntries.push([key, rhpRouteKey]);
    }

    return {
        widthWideRHPRouteKeys: allWideRHPKeys.filter(hasWidth),
        widthSuperWideRHPRouteKeys: allSuperWideRHPKeys.filter(hasWidth),
        displayedWideRHPRouteKeys: allWideRHPKeys.filter(isDisplayed),
        displayedSuperWideRHPRouteKeys: allSuperWideRHPKeys.filter(isDisplayed),
        presentRouteEntries,
    };
}

export default getVisibleRHPKeys;
