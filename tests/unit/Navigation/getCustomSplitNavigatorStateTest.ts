import getCustomSplitNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/getCustomSplitNavigatorState';
import {setLiveWideTabPreMountRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';

const PRE_MOUNT_KEY = 'Report-wide-pre-mount-1';

function buildState(routeKeys: string[]): PlatformStackNavigationState<ParamListBase> {
    return {
        key: 'split',
        index: routeKeys.length - 1,
        routeNames: ['Sidebar', 'Report'],
        routes: routeKeys.map((key, index) => ({key, name: index === 0 ? 'Sidebar' : 'Report'})),
        stale: false,
        type: 'stack',
        preloadedRoutes: [],
    };
}

function getRenderedKeys(routeKeys: string[], shouldUseNarrowLayout: boolean) {
    return getCustomSplitNavigatorState({state: buildState(routeKeys), shouldUseNarrowLayout}).routes.map((route) => route.key);
}

describe('getCustomSplitNavigatorState', () => {
    afterEach(() => {
        setLiveWideTabPreMountRouteKey(undefined);
    });

    it('renders the sidebar and the last two central screens on wide', () => {
        // Given a wide split stack with three central screens and no pre-mount
        // When the rendered routes are computed
        const renderedKeys = getRenderedKeys(['sidebar', 'a', 'b', 'c'], false);

        // Then the oldest central screen is dropped, so only the visible screen and the one below it stay mounted
        expect(renderedKeys).toEqual(['sidebar', 'b', 'c']);
    });

    it('keeps the screen below the top one mounted when a wide pre-mount is inserted under the top screen', () => {
        // Given a wide submit pre-mount inserted under the top screen 'c', with 'b' below it
        setLiveWideTabPreMountRouteKey(PRE_MOUNT_KEY);

        // When the rendered routes are computed
        const renderedKeys = getRenderedKeys(['sidebar', 'a', 'b', PRE_MOUNT_KEY, 'c'], false);

        // Then 'b' stays mounted next to the pre-mount, because unmounting it would remount it on cancel and clear its drafts
        expect(renderedKeys).toEqual(['sidebar', 'b', PRE_MOUNT_KEY, 'c']);
    });

    it('counts a pre-mount key that is no longer live as a regular central screen', () => {
        // Given a route whose key looks like a pre-mount, but the pre-mount was already revealed or cancelled
        // When the rendered routes are computed
        const renderedKeys = getRenderedKeys(['sidebar', 'a', 'b', PRE_MOUNT_KEY, 'c'], false);

        // Then it takes a regular central slot like any other screen
        expect(renderedKeys).toEqual(['sidebar', PRE_MOUNT_KEY, 'c']);
    });

    it('renders only the last two routes on narrow, even with a live pre-mount', () => {
        // Given a live pre-mount key, which narrow layouts never create but the narrow branch must ignore
        setLiveWideTabPreMountRouteKey(PRE_MOUNT_KEY);

        // When the rendered routes are computed on narrow
        const renderedKeys = getRenderedKeys(['sidebar', 'a', PRE_MOUNT_KEY, 'c'], true);

        // Then the narrow behavior is unchanged
        expect(renderedKeys).toEqual([PRE_MOUNT_KEY, 'c']);
    });
});
