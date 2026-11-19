import {render} from '@testing-library/react-native';

import FlatNavTabPressListeners from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/FlatNavTabPressListeners';
import type {NativeTabName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';
import NativeTabLayout from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NativeTabLayout';
import type {NativeTabLayoutProps} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NativeTabLayout';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

import createMock from '../utils/createMock';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flex1: {}, flexRow: {}})));
jest.mock('@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar', () => jest.fn(() => null));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NativeTabBarOverlay', () => jest.fn(() => null));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/TabPressListeners', () => jest.fn(() => null));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/FlatNavTabPressListeners', () => jest.fn(() => null));

const TAB_NAMES = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.INSIGHTS,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
];

const onTabsMount = jest.fn();

function Tabs() {
    useEffect(() => {
        onTabsMount();
    }, []);
    return null;
}

function renderTabs(tabWithoutBarItem: NativeTabName, selectedTabIndex: number, tabNames: string[] = TAB_NAMES) {
    const routes = tabNames.map((name) => ({key: `${name}-key`, name}));
    return (
        <NativeTabLayout
            state={createMock<NativeTabLayoutProps['state']>({routes, index: selectedTabIndex})}
            navigation={createMock<NativeTabLayoutProps['navigation']>({})}
            descriptors={Object.fromEntries(
                routes.map((route) => [route.key, createMock<NativeTabLayoutProps['descriptors'][string]>({options: {tabBarItemHidden: route.name === tabWithoutBarItem}})]),
            )}
        >
            <Tabs />
        </NativeTabLayout>
    );
}

describe('NativeTabLayout', () => {
    it('remounts the native tabs when the tab without a bar item changes, and not when a tab is selected', () => {
        // Given the tabs shown with Account as the tab without a bar item, as the app does today
        const {rerender} = render(renderTabs(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, 0));

        // When another tab is selected
        rerender(renderTabs(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, 1));

        // Then the native tabs stay mounted, so the tabs keep their state
        expect(onTabsMount).toHaveBeenCalledTimes(1);

        // When Insights becomes the tab without a bar item, and then Account again
        rerender(renderTabs(SCREENS.INSIGHTS, 1));
        rerender(renderTabs(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, 1));

        // Then the native tabs are remounted for each change, since the Android tab host can't swap a tab in place
        expect(onTabsMount).toHaveBeenCalledTimes(3);
    });

    it('handles the flat nav item presses only when the flat nav placeholders are registered', () => {
        // Given the tabs of today, without the placeholders the flat nav beta registers
        const {rerender} = render(renderTabs(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, 0));

        // Then no flat nav press handling is mounted, so the bar without the beta behaves as before
        expect(FlatNavTabPressListeners).not.toHaveBeenCalled();

        // When the beta registers the Expenses, Reports and More placeholders
        rerender(renderTabs(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, 0, [...TAB_NAMES, SCREENS.NATIVE_TAB_ITEM.EXPENSES, SCREENS.NATIVE_TAB_ITEM.REPORTS, SCREENS.NATIVE_TAB_ITEM.MORE]));

        // Then their presses are handled
        expect(FlatNavTabPressListeners).toHaveBeenCalled();
    });
});
