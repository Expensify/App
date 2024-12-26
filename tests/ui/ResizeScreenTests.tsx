import {NavigationContainer} from '@react-navigation/native';
import {render, renderHook} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createResponsiveStackNavigator from '@libs/Navigation/AppNavigator/createResponsiveStackNavigator';
import BottomTabNavigator from '@libs/Navigation/AppNavigator/Navigators/BottomTabNavigator';
import useNavigationResetRootOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetRootOnLayoutChange';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import ProfilePage from '@pages/settings/Profile/ProfilePage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const RootStack = createResponsiveStackNavigator<AuthScreensParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/settings/InitialSettingsPage');
jest.mock('@pages/settings/Profile/ProfilePage');
jest.mock('@libs/Navigation/AppNavigator/createCustomBottomTabNavigator/BottomTabBar');

const DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: false,
};

const INITIAL_STATE = {
    routes: [
        {
            name: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
            state: {
                index: 1,
                routes: [{name: SCREENS.HOME}, {name: SCREENS.SETTINGS.ROOT}],
            },
        },
    ],
};

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Resize screen', () => {
    it('Should display the settings profile after resizing the screen with the settings page opened to the wide layout', () => {
        // Given the initialized navigation on the narrow layout with the settings screen
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});

        const {rerender} = renderHook(() => useNavigationResetRootOnLayoutChange());

        render(
            <NavigationContainer
                ref={navigationRef}
                initialState={INITIAL_STATE}
            >
                <RootStack.Navigator>
                    <RootStack.Screen
                        name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
                        component={BottomTabNavigator}
                    />

                    <RootStack.Screen
                        name={SCREENS.SETTINGS.PROFILE.ROOT}
                        component={ProfilePage}
                    />
                </RootStack.Navigator>
            </NavigationContainer>,
        );

        const rootStateBeforeResize = navigationRef.current?.getRootState();

        expect(rootStateBeforeResize?.routes.at(0)?.name).toBe(NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
        expect(rootStateBeforeResize?.routes.at(1)).toBeUndefined();

        // When resizing the screen to the wide layout
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
        rerender({});

        const rootStateAfterResize = navigationRef.current?.getRootState();

        // Then the settings profile page should be displayed on the screen
        expect(rootStateAfterResize?.routes.at(0)?.name).toBe(NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
        expect(rootStateAfterResize?.routes.at(1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
    });
});
