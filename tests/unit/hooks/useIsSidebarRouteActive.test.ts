import useIsSidebarRouteActive from '@libs/Navigation/helpers/useIsSidebarRouteActive';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';
import {renderHook} from '@testing-library/react-native';

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(() => undefined),
    isReady: jest.fn(() => true),
    addListener: jest.fn(() => () => {}),
}));

jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(),
}));

/* eslint-disable @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding */
const mockedGetRootState = navigationRef.getRootState as unknown as jest.Mock;
const mockedFindFocusedRoute = findFocusedRoute as unknown as jest.Mock;
/* eslint-enable @typescript-eslint/unbound-method */

describe('useIsSidebarRouteActive', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Regression test for #89181: post-#85234, TAB_NAVIGATOR wraps every split navigator, so the hook
    // must descend one level into the active tab to find the split navigator.
    it('returns true when TAB_NAVIGATOR wraps the requested split on a wide layout', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.PROFILE.ROOT}]}},
                        ],
                    },
                },
            ],
        });
        mockedFindFocusedRoute.mockReturnValue({name: SCREENS.SETTINGS.PROFILE.ROOT});

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(true);
    });

    it('returns true on narrow layout when the focused route is the sidebar route', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.ROOT}]}},
                        ],
                    },
                },
            ],
        });
        mockedFindFocusedRoute.mockReturnValue({name: SCREENS.SETTINGS.ROOT});

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, true));

        expect(result.current).toBe(true);
    });

    // Preserves the protection added by #63231: on narrow layouts the popover must not open
    // when a sub-page is focused, because the sidebar row is off-screen-equivalent there.
    it('returns false on narrow layout when the focused route is a sub-page (preserves #63231 guard)', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.PROFILE.ROOT}]}},
                        ],
                    },
                },
            ],
        });
        mockedFindFocusedRoute.mockReturnValue({name: SCREENS.SETTINGS.PROFILE.ROOT});

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, true));

        expect(result.current).toBe(false);
    });

    it('returns false when TAB_NAVIGATOR active tab is a different split than requested', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.INBOX}]}},
                            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.ROOT}]}},
                        ],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(false);
    });

    it('returns false when the last root route is an RHP/modal stacked on top of TAB_NAVIGATOR', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [{name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.ROOT}]}}],
                    },
                },
                {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
            ],
        });

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(false);
    });

    it('returns false without throwing when the navigation state is not hydrated', () => {
        mockedGetRootState.mockReturnValue(undefined);

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(false);
    });

    // Regression test: during partial hydration / linking, `state.index` can be absent. React Navigation's
    // convention is to treat the first route as focused in that case — falling back to the last route would
    // incorrectly resolve to WORKSPACE_NAVIGATOR (the last tab) and break Settings.
    it('falls back to the first tab when TAB_NAVIGATOR state has no index', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [{name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.ROOT}]}}, {name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                    },
                },
            ],
        });
        mockedFindFocusedRoute.mockReturnValue({name: SCREENS.SETTINGS.ROOT});

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(true);
    });

    it('returns false without throwing when TAB_NAVIGATOR has no nested state', () => {
        mockedGetRootState.mockReturnValue({routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(false);
    });
});
