import {render, screen} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getPlatform from '@libs/getPlatform';
import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../utils/createMock';

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string}>;
};

let mockEnabledBetas: string[] = [];

jest.mock('@components/Navigation/FlatNavigationBar', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return () => createElement(View, {testID: 'FlatNavigationBar'});
});

jest.mock('@components/Navigation/NavigationTabBar', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return () => createElement(View, {testID: 'NavigationTabBar'});
});

jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const tabBarState = createMock<BottomTabBarProps['state']>({
    index: 0,
    routes: [{key: 'home', name: SCREENS.HOME, params: undefined}],
});

function mockLayout(shouldUseNarrowLayout: boolean) {
    jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout}));
}

describe('TabNavigatorBar with the flatNav beta', () => {
    beforeEach(() => {
        mockEnabledBetas = [];
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
    });

    it('renders the flat navigation bar on wide when the beta is on', () => {
        // Given a wide layout and a user on the flatNav beta
        mockLayout(false);
        mockEnabledBetas = [CONST.BETAS.FLAT_NAV];

        // When the tab navigator draws its bar
        render(<TabNavigatorBar state={tabBarState} />);

        // Then the flat bar replaces the icon bar, because the beta is what opts the user into the new navigation
        expect(screen.getByTestId('FlatNavigationBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('NavigationTabBar')).not.toBeOnTheScreen();
    });

    it('keeps the icon bar on wide when the beta is off', () => {
        // Given a wide layout and a user without the flatNav beta
        mockLayout(false);

        // When the tab navigator draws its bar
        render(<TabNavigatorBar state={tabBarState} />);

        // Then nothing changes for users outside the beta
        expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('FlatNavigationBar')).not.toBeOnTheScreen();
    });

    it('keeps the bottom bar on narrow even when the beta is on', () => {
        // Given a narrow layout and a user on the flatNav beta
        mockLayout(true);
        mockEnabledBetas = [CONST.BETAS.FLAT_NAV];

        // When the tab navigator draws its bar
        render(<TabNavigatorBar state={tabBarState} />);

        // Then the bottom bar stays, because the flat bar is only the wide layout's navigation for now
        expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('FlatNavigationBar')).not.toBeOnTheScreen();
    });

    it('keeps the icon bar on a wide native layout even when the beta is on', () => {
        // Given a tablet, which renders the same tab bar on wide, and a user on the flatNav beta
        mockLayout(false);
        mockEnabledBetas = [CONST.BETAS.FLAT_NAV];
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);

        // When the tab navigator draws its bar
        render(<TabNavigatorBar state={tabBarState} />);

        // Then the icon bar stays, because the flat bar is web only until its anchors handle native safe areas
        expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('FlatNavigationBar')).not.toBeOnTheScreen();
    });
});
