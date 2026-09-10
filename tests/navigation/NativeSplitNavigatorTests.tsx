import {act, render, screen, waitFor} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {CommonActions, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

function SidebarScreen() {
    return <View testID="split-sidebar" />;
}

function CentralScreen() {
    return <View testID="split-central" />;
}

describe('NativeSplitNavigator', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue(CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE);
    });

    it('renders sidebar and central routes from an isolated wide layout', async () => {
        render(
            <NavigationContainer
                ref={navigationRef}
                initialState={{routes: [{name: SCREENS.INBOX}]}}
            >
                <Split.Navigator
                    sidebarScreen={SCREENS.INBOX}
                    defaultCentralScreen={SCREENS.REPORT}
                    persistentScreens={[SCREENS.INBOX]}
                    parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
                    layoutMode="wide"
                >
                    <Split.Screen
                        name={SCREENS.INBOX}
                        component={SidebarScreen}
                    />
                    <Split.Screen
                        name={SCREENS.REPORT}
                        component={CentralScreen}
                    />
                </Split.Navigator>
            </NavigationContainer>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('split-sidebar')).toBeOnTheScreen();
            expect(screen.getByTestId('split-central')).toBeOnTheScreen();
        });

        const state = navigationRef.current?.getRootState();
        expect(state?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX, SCREENS.REPORT]);
        expect(state?.index).toBe(1);

        act(() => navigationRef.current?.dispatch(CommonActions.navigate(SCREENS.INBOX)));

        const stateAfterSidebarNavigation = navigationRef.current?.getRootState();
        expect(stateAfterSidebarNavigation?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX, SCREENS.REPORT]);
        expect(stateAfterSidebarNavigation?.index).toBe(1);
    });
});
