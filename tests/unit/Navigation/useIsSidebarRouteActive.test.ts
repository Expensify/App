import {renderHook} from '@testing-library/react-native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const mockRootState = jest.fn((): unknown => undefined);
jest.mock('@hooks/useRootNavigationState', () => (selector: (state: unknown) => unknown) => selector(mockRootState()));

const useIsSidebarRouteActive = (require('@libs/Navigation/helpers/useIsSidebarRouteActive') as {default: (split: string, narrow: boolean) => boolean}).default;

describe('useIsSidebarRouteActive', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Regression for #89181: after PR #85234, SETTINGS_SPLIT_NAVIGATOR is nested inside TAB_NAVIGATOR
    // instead of sitting directly on the root stack. The hook used to read rootState.routes.at(-1)
    // expecting a SplitNavigator there, but now it gets TabNavigator and incorrectly returns false.
    // Symptom: right-click context menu on /settings menu items (e.g. "What's new") never opens
    // because SettingsMenuItem.onSecondaryInteraction bails on !isScreenFocused.
    it('returns true on wide layout when SETTINGS_SPLIT_NAVIGATOR is the focused tab inside TAB_NAVIGATOR', () => {
        mockRootState.mockReturnValue({
            index: 0,
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {
                                name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                state: {
                                    index: 0,
                                    routes: [{name: SCREENS.SETTINGS.ROOT}],
                                },
                            },
                            {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                        ],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(true);
    });

    it('returns true on narrow layout when Settings_Root is the focused screen inside the split navigator', () => {
        mockRootState.mockReturnValue({
            index: 0,
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {
                                name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                state: {
                                    index: 0,
                                    routes: [{name: SCREENS.SETTINGS.ROOT}],
                                },
                            },
                            {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                        ],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, true));

        expect(result.current).toBe(true);
    });

    // Regression guard for #63231: when a RIGHT_MODAL_NAVIGATOR (RHP) is layered on top of the
    // TabNavigator, the sidebar is no longer the active screen — the hook must return false so that
    // SettingsMenuItem doesn't open a context menu while a modal is in focus.
    it('returns false when a modal navigator is layered on top of the TabNavigator', () => {
        mockRootState.mockReturnValue({
            index: 1,
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {
                                name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                state: {
                                    index: 0,
                                    routes: [{name: SCREENS.SETTINGS.ROOT}],
                                },
                            },
                            {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                        ],
                    },
                },
                {
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{name: SCREENS.SETTINGS.PROFILE.ROOT}],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, false));

        expect(result.current).toBe(false);
    });

    // Preserves the narrow-layout protection from #63231: on narrow viewports the sidebar is only
    // "active" when its own route (Settings_Root) is focused. A pushed child screen inside the split
    // (e.g. Settings_Profile) means the sidebar is hidden, so the hook must return false.
    it('returns false on narrow layout when a non-sidebar child screen is focused inside the split navigator', () => {
        mockRootState.mockReturnValue({
            index: 0,
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 3,
                        routes: [
                            {name: SCREENS.HOME},
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {
                                name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                                state: {
                                    index: 1,
                                    routes: [{name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.PROFILE.ROOT}],
                                },
                            },
                            {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                        ],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, true));

        expect(result.current).toBe(false);
    });
});
