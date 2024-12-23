import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createResponsiveStackNavigator from '@libs/Navigation/AppNavigator/createResponsiveStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const RootStack = createResponsiveStackNavigator<AuthScreensParamList>();
const Split = createSplitNavigator<SettingsSplitNavigatorParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/home/sidebar/BottomTabAvatar');

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

const INITIAL_SETTINGS_STATE = {
    index: 0,
    routes: [
        {
            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
            state: {
                index: 2,
                routes: [
                    {
                        name: SCREENS.SETTINGS.ROOT,
                    },
                    {
                        name: SCREENS.SETTINGS.PROFILE.ROOT,
                    },
                    {
                        name: SCREENS.SETTINGS.PREFERENCES.ROOT,
                    },
                ],
            },
        },
    ],
};

const PARENT_ROUTE = {key: 'parentRouteKey', name: 'ParentNavigator'};

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

function SettingsSplitNavigator() {
    return (
        <Split.Navigator
            sidebarScreen={SCREENS.SETTINGS.ROOT}
            defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
            parentRoute={PARENT_ROUTE}
        >
            <Split.Screen
                name={SCREENS.SETTINGS.ROOT}
                getComponent={() => jest.fn()}
            />
            <Split.Screen
                name={SCREENS.SETTINGS.PROFILE.ROOT}
                getComponent={() => jest.fn()}
            />
            <Split.Screen
                name={SCREENS.SETTINGS.PREFERENCES.ROOT}
                getComponent={() => jest.fn()}
            />
            <Split.Screen
                name={SCREENS.SETTINGS.ABOUT}
                getComponent={() => jest.fn()}
            />
        </Split.Navigator>
    );
}

function NavigationContainerWithSettings() {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={INITIAL_SETTINGS_STATE}
        >
            <RootStack.Navigator>
                <RootStack.Screen
                    name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                    component={SettingsSplitNavigator}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

describe('Go back on the narrow layout without comparing route params', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('Should pop the last page in the navigation state', () => {
        // Given the initialized navigation on the narrow layout with the settings split navigator
        render(<NavigationContainerWithSettings />);

        const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
        expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

        // When go back without specifying fallbackRoute
        act(() => {
            Navigation.goBack();
        });

        // Then pop the last screen from the navigation state
        const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitAfterGoBack?.state?.index).toBe(1);
        expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
    });

    it('Should go back to the page passed to goBack as a fallbackRoute', () => {
        // Given the initialized navigation on the narrow layout with the settings split navigator
        render(<NavigationContainerWithSettings />);

        const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
        expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

        // When go back to the fallbackRoute present in the navigation state
        act(() => {
            Navigation.goBack(ROUTES.SETTINGS);
        });

        // Then pop to the fallbackRoute
        const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitAfterGoBack?.state?.index).toBe(0);
        expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
    });

    it('Should replace the current page with the page passed as a fallbackRoute', () => {
        // Given the initialized navigation on the narrow layout with the settings split navigator
        render(<NavigationContainerWithSettings />);

        const settingsSplitBeforeGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitBeforeGoBack?.state?.index).toBe(2);
        expect(settingsSplitBeforeGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PREFERENCES.ROOT);

        // When go back to the fallbackRoute that does not exist in the navigation state
        act(() => {
            Navigation.goBack(ROUTES.SETTINGS_ABOUT);
        });

        // Then replace the current page with the page passed as a fallbackRoute
        const settingsSplitAfterGoBack = navigationRef.current?.getRootState().routes.at(0);
        expect(settingsSplitAfterGoBack?.state?.index).toBe(2);
        expect(settingsSplitAfterGoBack?.state?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ABOUT);
    });
});
