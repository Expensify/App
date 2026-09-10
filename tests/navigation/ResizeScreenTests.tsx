import {render, waitFor} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationLayoutMode} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';

import InitialSettingsPage from '@pages/settings/InitialSettingsPage';
import ProfilePage from '@pages/settings/Profile/ProfilePage';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

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

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

describe('Resize screen', () => {
    const renderNavigator = (layoutMode: NavigationLayoutMode) => (
        <NavigationContainer
            ref={navigationRef}
            initialState={INITIAL_STATE}
        >
            <Split.Navigator
                sidebarScreen={SCREENS.SETTINGS.ROOT}
                defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
                parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
                layoutMode={layoutMode}
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
        </NavigationContainer>
    );

    it('displays the settings profile after changing the split navigator to wide layout', async () => {
        // Given the initialized navigation on the narrow layout with the settings screen
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});

        const {rerender} = render(renderNavigator('narrow'));

        const navigation = navigationRef.current;
        if (!navigation) {
            throw new Error('Navigation container ref was not initialized');
        }

        const rootStateBeforeResize = navigationRef.current?.getRootState();

        expect(rootStateBeforeResize?.routes.at(0)?.name).toBe(SCREENS.SETTINGS.ROOT);
        expect(rootStateBeforeResize?.routes.at(1)).toBeUndefined();
        expect(rootStateBeforeResize?.index).toBe(0);

        // When resizing the screen to the wide layout
        rerender(renderNavigator('wide'));

        // Then the settings profile page should be displayed on the screen
        await waitFor(() => {
            const rootStateAfterResize = navigationRef.current?.getRootState();
            expect(rootStateAfterResize?.routes.at(0)?.name).toBe(SCREENS.SETTINGS.ROOT);
            expect(rootStateAfterResize?.routes.at(1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
            expect(rootStateAfterResize?.index).toBe(1);
        });
    });
});
