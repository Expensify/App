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

// Mock Fullstory library dependency
jest.mock('@libs/Fullstory', () => ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    parseFSAttributes: jest.fn(),
}));

jest.mock('@pages/home/sidebar/NavigationTabBarAvatar');
jest.mock('@src/components/Navigation/TopLevelNavigationTabBar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Navigation', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });
    // given current active route is "/settings/profile?backTo=settings%2profile"
    test.each([
        ['settings/profile' as Route, true],
        ['settings/profile/' as Route, true],
        ['settings/profile?param=1' as Route, true],
        ['settings/profile/display-name' as Route, false],
        ['settings/profile/display-name/' as Route, false],
        ['settings/preferences' as Route, false],
        ['report' as Route, false],
        ['report/123/' as Route, false],
        ['report/123' as Route, false],
    ])('isActiveRoute("%s") should return %s', (routeToCheck, expectedResult) => {
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
        const result = Navigation.isActiveRoute(routeToCheck);
        expect(result).toBe(expectedResult);
    });
});
