import {describe, expect} from '@jest/globals';
import {cleanup, render} from '@testing-library/react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
import navigationRef from '@src/libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/home/sidebar/NavigationTabBarAvatar');
jest.mock('@src/components/Navigation/TopLevelNavigationTabBar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Navigation', () => {
    afterEach(() => {
        // Ensure mounted components are unmounted
        cleanup();

        // Clear timers and restore real timers (in case fake timers are used anywhere)
        jest.clearAllTimers();
        jest.useRealTimers();

        // Reset any mocks used by this file
        jest.restoreAllMocks();
        jest.resetModules();

        // Clear the navigation ref so listeners/hooks attached to it don't keep the worker alive.
        // This is intentionally type-unsafe to forcibly drop the ref between tests.
        if (navigationRef.current) {
            navigationRef.current = null;
        }
    });
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('Should correctly identify active routes', () => {
        // Given current active route is "/settings/profile?backTo=settings%2profile"
        render(
            <TestNavigationContainer
                initialState={{
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                            state: {
                                index: 1,
                                routes: [
                                    {
                                        name: SCREENS.SETTINGS.ROOT,
                                    },
                                    {
                                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                                        params: {
                                            backTo: 'settings/profile',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }}
            />,
        );

        expect(Navigation.isActiveRoute('settings/profile' as Route)).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile/' as Route)).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile?param=1' as Route)).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile/display-name' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('settings/profile/display-name/' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('settings/preferences' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('settings/preferences/' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('report' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('report/123/' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('report/123' as Route)).toBe(false);
    });
});
