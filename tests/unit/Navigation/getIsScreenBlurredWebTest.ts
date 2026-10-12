import getIsScreenBlurred from '@libs/Navigation/AppNavigator/FreezeWrapper/getIsScreenBlurred';
import {setLiveWideTabPreMountTabRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

// Jest resolves the native variant for the plain module path, so the web implementation is loaded by its file path.
jest.mock('@libs/Navigation/AppNavigator/FreezeWrapper/getIsScreenBlurred', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/AppNavigator/FreezeWrapper/getIsScreenBlurred/index.ts'),
);

const HOME_TAB_KEY = 'home-tab-key';
const INBOX_TAB_KEY = 'inbox-tab-key';

function makeTabState(focusedKey: string): NavigationState {
    const routes = [
        {key: HOME_TAB_KEY, name: SCREENS.HOME},
        {key: INBOX_TAB_KEY, name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
    ];
    return {
        key: 'tab-state',
        index: routes.findIndex((route) => route.key === focusedKey),
        routes,
        routeNames: routes.map((route) => route.name),
        stale: false,
        type: 'tab',
    } as NavigationState;
}

describe('getIsScreenBlurred (web)', () => {
    afterEach(() => {
        setLiveWideTabPreMountTabRouteKey(undefined);
    });

    it('does not blur the focused tab', () => {
        // Given a tab navigator with Home focused
        const state = makeTabState(HOME_TAB_KEY);

        // When checking the focused tab
        const isBlurred = getIsScreenBlurred(state, HOME_TAB_KEY, {freezeWhenInTabBackground: true});

        // Then it keeps rendering, because the user sees it
        expect(isBlurred).toBe(false);
    });

    it('blurs a background tab', () => {
        // Given a tab navigator with Home focused and no wide pre-mount
        const state = makeTabState(HOME_TAB_KEY);

        // When checking the Inbox tab behind it
        const isBlurred = getIsScreenBlurred(state, INBOX_TAB_KEY, {freezeWhenInTabBackground: true});

        // Then it is frozen, because nothing in it is visible
        expect(isBlurred).toBe(true);
    });

    it('does not blur a background tab holding the live wide pre-mount', () => {
        // Given a wide submit pre-mount living in the Inbox tab while Home is focused
        const state = makeTabState(HOME_TAB_KEY);
        setLiveWideTabPreMountTabRouteKey(INBOX_TAB_KEY);

        // When checking the Inbox tab
        const isBlurred = getIsScreenBlurred(state, INBOX_TAB_KEY, {freezeWhenInTabBackground: true});

        // Then it keeps rendering, so the pre-mounted destination is ready before its reveal instead of mounting on it
        expect(isBlurred).toBe(false);
    });

    it('blurs a background tab once the wide pre-mount is gone', () => {
        // Given a pre-mount that lived in the Inbox tab and was then cleared (cancel or reveal)
        const state = makeTabState(HOME_TAB_KEY);
        setLiveWideTabPreMountTabRouteKey(INBOX_TAB_KEY);
        setLiveWideTabPreMountTabRouteKey(undefined);

        // When checking the Inbox tab
        const isBlurred = getIsScreenBlurred(state, INBOX_TAB_KEY, {freezeWhenInTabBackground: true});

        // Then it is frozen again, so a cancelled pre-mount does not keep a background tab rendering
        expect(isBlurred).toBe(true);
    });

    it('blurs every fullscreen route but the last one outside a tab navigator', () => {
        // Given a root stack with two fullscreen routes and a modal on top
        const state = {
            key: 'root-state',
            index: 2,
            routes: [
                {key: 'first-fullscreen', name: NAVIGATORS.TAB_NAVIGATOR},
                {key: 'last-fullscreen', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                {key: 'modal', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
            ],
            routeNames: [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR],
            stale: false,
            type: 'stack',
        } as NavigationState;

        // When checking both fullscreen routes
        const isFirstBlurred = getIsScreenBlurred(state, 'first-fullscreen');
        const isLastBlurred = getIsScreenBlurred(state, 'last-fullscreen');

        // Then only the one under the modal keeps rendering, because the modal does not hide it
        expect(isFirstBlurred).toBe(true);
        expect(isLastBlurred).toBe(false);
    });
});
