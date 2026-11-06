import getCustomState from '@libs/Navigation/AppNavigator/createSearchFullscreenNavigator/useCustomState';
import {setLiveWideTabPreMountRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import SCREENS from '@src/SCREENS';

import type {ParamListBase} from '@react-navigation/native';

const PRE_MOUNT_KEY = 'Search_Root-wide-pre-mount-1';

function buildState(routes: Array<{key: string; name: string}>): PlatformStackNavigationState<ParamListBase> {
    return {
        key: 'search-fullscreen',
        index: routes.length - 1,
        routeNames: [SCREENS.SEARCH.ROOT, SCREENS.SEARCH.MONEY_REQUEST_REPORT],
        routes,
        stale: false,
        type: 'stack',
        preloadedRoutes: [],
    };
}

function getRenderedKeys(routes: Array<{key: string; name: string}>) {
    return getCustomState({state: buildState(routes)}).routes.map((route) => route.key);
}

describe('SearchFullscreenNavigator getCustomState', () => {
    afterEach(() => {
        setLiveWideTabPreMountRouteKey(undefined);
    });

    it('renders from the last Search root onward', () => {
        // Given an older Search root, a newer one and a report opened from it
        const routes = [
            {key: 'old-root', name: SCREENS.SEARCH.ROOT},
            {key: 'new-root', name: SCREENS.SEARCH.ROOT},
            {key: 'report', name: SCREENS.SEARCH.MONEY_REQUEST_REPORT},
        ];

        // When the rendered routes are computed
        // Then only the newest Search root and what is above it stay mounted
        expect(getRenderedKeys(routes)).toEqual(['new-root', 'report']);
    });

    it('keeps the covered Search root mounted under a live wide pre-mount', () => {
        // Given a wide submit pre-mount pushed as a new Search root over the Reports search the tab was showing
        setLiveWideTabPreMountRouteKey(PRE_MOUNT_KEY);
        const routes = [
            {key: 'reports-root', name: SCREENS.SEARCH.ROOT},
            {key: PRE_MOUNT_KEY, name: SCREENS.SEARCH.ROOT},
        ];

        // When the rendered routes are computed
        // Then the Reports search stays mounted, so cancelling the form does not remount it and lose its state
        expect(getRenderedKeys(routes)).toEqual(['reports-root', PRE_MOUNT_KEY]);
    });

    it('drops the covered Search root once the pre-mount is revealed', () => {
        // Given the same stack after the reveal, when the pre-mount key is no longer live
        const routes = [
            {key: 'reports-root', name: SCREENS.SEARCH.ROOT},
            {key: PRE_MOUNT_KEY, name: SCREENS.SEARCH.ROOT},
        ];

        // When the rendered routes are computed
        // Then the revealed screen is a regular Search root and the one below unmounts, like on a plain navigation
        expect(getRenderedKeys(routes)).toEqual([PRE_MOUNT_KEY]);
    });
});
