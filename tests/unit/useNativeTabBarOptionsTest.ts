import {renderHook} from '@testing-library/react-native';

import useTheme from '@hooks/useTheme';

import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import useAndroidNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.android';
import useIOSNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.ios';
import type NativeTabBarOptionsParams from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/types';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const mockGetTabBarIcon = jest.mocked(getTabBarIcon);

const PARAMS: NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: true,
    dotColors: {[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: '#ff0000'},
    tabLabels: {
        [SCREENS.HOME]: 'Home',
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'Inbox',
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: 'Spend',
        [SCREENS.INSIGHTS]: 'Insights',
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: 'Workspaces',
    },
};

const FLAT_NAV_PARAMS: NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: true,
    dotColors: {[SCREENS.NATIVE_TAB_ITEM.MORE]: '#ff0000'},
    tabLabels: {
        [SCREENS.HOME]: 'Home',
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'Inbox',
        [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: 'Expenses',
        [SCREENS.NATIVE_TAB_ITEM.REPORTS]: 'Reports',
        [SCREENS.NATIVE_TAB_ITEM.MORE]: 'More',
    },
};

describe.each([
    ['Android', useAndroidNativeTabBarOptions, 'tabBarLabel'],
    ['iOS', useIOSNativeTabBarOptions, 'tabBarAccessibilityLabel'],
] as const)('%s useNativeTabBarOptions', (_platform, useNativeTabBarOptions, labelOption) => {
    beforeEach(() => {
        mockGetTabBarIcon.mockClear();
    });

    it('draws glyphs and status dots in both selection states without account badges', () => {
        // Given an Inbox tab with a status dot
        const {result} = renderHook(() => ({options: useNativeTabBarOptions(PARAMS), theme: useTheme()}));

        // When its icon is drawn
        result.current.options.getTabOptions(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        const getParams = mockGetTabBarIcon.mock.calls.at(-1)?.[1];

        // Then each state keeps its glyph color and status dot, without avatar or emoji data
        for (const isSelected of [false, true]) {
            const params = getParams?.(isSelected);
            expect(params).toMatchObject({
                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                color: isSelected ? result.current.theme.iconMenu : result.current.theme.icon,
                dotColor: PARAMS.dotColors[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR],
            });
            expect(params).not.toHaveProperty('avatar');
            expect(params).not.toHaveProperty('emojiStatus');
        }
    });

    it('keeps the tab label accessible', () => {
        // Given the five visible native tabs
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));

        // When the Inbox tab options are built
        const options = result.current.getTabOptions(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

        // Then the native label or accessibility label still names the tab
        expect(options[labelOption]).toBe('Inbox');
    });

    it.each([
        [SCREENS.NATIVE_TAB_ITEM.EXPENSES, FLAT_NAV_TAB_BAR_SLOT.EXPENSES, 'Expenses'],
        [SCREENS.NATIVE_TAB_ITEM.REPORTS, FLAT_NAV_TAB_BAR_SLOT.REPORTS, 'Reports'],
        [SCREENS.NATIVE_TAB_ITEM.MORE, FLAT_NAV_TAB_BAR_SLOT.MORE, 'More'],
    ])('draws the %s placeholder with the glyph of its slot and its own label', (routeName, glyphName, label) => {
        // Given the five items of the flat nav bar, where Expenses, Reports and More are placeholders with no glyph of their own
        const {result} = renderHook(() => useNativeTabBarOptions(FLAT_NAV_PARAMS));

        // When the placeholder options are built
        const options = result.current.getTabOptions(routeName);
        const params = mockGetTabBarIcon.mock.calls.at(-1)?.[1]?.(false);

        // Then it draws the glyph of its slot and the dot it was given, and names itself for VoiceOver or Material
        expect(params).toMatchObject({name: glyphName, dotColor: FLAT_NAV_PARAMS.dotColors[routeName]});
        expect(options[labelOption]).toBe(label);
    });
});
