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
});
