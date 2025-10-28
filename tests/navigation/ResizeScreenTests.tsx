import type {ParamListBase} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {render, renderHook} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import navigationRef from '@libs/Navigation/navigationRef';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import InitialSettingsPage from '@pages/settings/InitialSettingsPage';
import ProfilePage from '@pages/settings/Profile/ProfilePage';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

const Split = createSplitNavigator<SettingsSplitNavigatorParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/settings/InitialSettingsPage');
jest.mock('@pages/settings/Profile/ProfilePage');

const INITIAL_STATE = {
    index: 0,
    routes: [
        {
            name: SCREENS.SETTINGS.ROOT,
        },
    ],
};

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Resize screen', () => {
    it('Should display the settings profile after resizing the screen with the settings page opened to the wide layout', () => {
        // Given the initialized navigation on the narrow layout with the settings screen
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});

        render(
            <NavigationContainer
                ref={navigationRef}
                initialState={INITIAL_STATE}
            >
                <Split.Navigator
                    sidebarScreen={SCREENS.SETTINGS.ROOT}
                    defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
                    parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
                >
                    <Split.Screen
                        name={SCREENS.SETTINGS.ROOT}
                        component={InitialSettingsPage}
                    />
                    <Split.Screen
                        name={SCREENS.SETTINGS.PROFILE.ROOT}
                        component={ProfilePage}
                    />
                </Split.Navigator>
            </NavigationContainer>,
        );

        const {rerender} = renderHook(() =>
            useNavigationResetOnLayoutChange({
                navigation: navigationRef.current as unknown as CustomEffectsHookProps<ParamListBase>['navigation'],
                displayName: 'SplitNavigator',
                descriptors: {},
                state: navigationRef.current?.getState() as CustomEffectsHookProps<ParamListBase>['state'],
            }),
        );

        const rootStateBeforeResize = navigationRef.current?.getRootState();

        expect(rootStateBeforeResize?.routes.at(0)?.name).toBe(SCREENS.SETTINGS.ROOT);
        expect(rootStateBeforeResize?.routes.at(1)).toBeUndefined();
        expect(rootStateBeforeResize?.index).toBe(0);

        // When resizing the screen to the wide layout
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
        rerender({});

        const rootStateAfterResize = navigationRef.current?.getRootState();

        // Then the settings profile page should be displayed on the screen
        expect(rootStateAfterResize?.routes.at(0)?.name).toBe(SCREENS.SETTINGS.ROOT);
        expect(rootStateAfterResize?.routes.at(1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
        expect(rootStateAfterResize?.index).toBe(1);
    });
});
