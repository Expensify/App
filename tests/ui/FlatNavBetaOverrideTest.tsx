import {act, cleanup, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getPlatform from '@libs/getPlatform';
import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {ComponentType} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string}>;
};

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

function renderBar() {
    return render(
        <OnyxListItemProvider>
            <TabNavigatorBar state={tabBarState} />
        </OnyxListItemProvider>,
    );
}

describe('TabNavigatorBar when the flatNav beta is overridden', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: false}));
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

    it('swaps the icon bar for the flat bar and back as the override is switched, without reopening the app', async () => {
        // Given a wide web user who is not on the flatNav beta
        renderBar();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();

        // When the beta is switched on from the beta overrides page
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.FLAT_NAV]: true});
        });

        // Then the flat bar replaces the icon bar in place, because testers flip the flag on a running app
        expect(screen.getByTestId('FlatNavigationBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('NavigationTabBar')).not.toBeOnTheScreen();

        // When the override is switched off again
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.FLAT_NAV]: false});
        });

        // Then the icon bar comes back, so turning the beta off leaves nothing of the new navigation behind
        expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('FlatNavigationBar')).not.toBeOnTheScreen();
    });

    it('lets an override that turns the beta off win over a user who has it on their account', async () => {
        // Given a wide web user whose account has the flatNav beta
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.FLAT_NAV]);
        renderBar();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('FlatNavigationBar')).toBeOnTheScreen();

        // When the beta is overridden to off
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.FLAT_NAV]: false});
        });

        // Then the icon bar shows, because an override is the way to compare both navigations on the same account
        expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();
        expect(screen.queryByTestId('FlatNavigationBar')).not.toBeOnTheScreen();
    });
});
