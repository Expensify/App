import {describe, expect, test} from '@jest/globals';
import {render} from '@testing-library/react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import CONST from '@src/CONST';
import Navigation from '@src/libs/Navigation/Navigation';
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
