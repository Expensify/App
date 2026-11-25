import {renderHook} from '@testing-library/react-native';

import useTheme from '@hooks/useTheme';

import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import useAndroidNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.android';
import useIOSNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.ios';
import type NativeTabBarOptionsParams from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/types';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {Platform} from 'react-native';

const mockGetTabBarIcon = jest.mocked(getTabBarIcon);

const PARAMS: NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: true,
    isTabBarVertical: false,
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
    isTabBarVertical: false,
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
        expect(params?.accessory).toBeUndefined();
        expect(options[labelOption]).toBe(label);
    });

    it('keeps room for the chevron in the More item only', () => {
        // Given the flat nav bar while the user is on no page picked from the More menu
        const {result} = renderHook(() => useNativeTabBarOptions(FLAT_NAV_PARAMS));

        // When the More and Expenses item options are built
        result.current.getTabOptions(SCREENS.NATIVE_TAB_ITEM.MORE);
        const getMoreParams = mockGetTabBarIcon.mock.calls.at(-1)?.[1];
        result.current.getTabOptions(SCREENS.NATIVE_TAB_ITEM.EXPENSES);
        const getExpensesParams = mockGetTabBarIcon.mock.calls.at(-1)?.[1];

        // Then only the More item is framed for the chevron it draws once an entry is picked, so the bar keeps its layout
        // when the item switches glyphs
        for (const isSelected of [false, true]) {
            expect(getMoreParams?.(isSelected).reservesAccessory).toBe(true);
            expect(getExpensesParams?.(isSelected).reservesAccessory).toBeFalsy();
        }
    });

    it.each([
        [MORE_MENU.ITEM.ACCOUNTING, MORE_MENU.ITEM.ACCOUNTING],
        [MORE_MENU.ITEM.SAVED, MORE_MENU.ITEM.SAVED],
        [MORE_MENU.ITEM.INSIGHTS, SCREENS.INSIGHTS],
        [MORE_MENU.ITEM.WORKSPACES, NAVIGATORS.WORKSPACE_NAVIGATOR],
    ] as const)('draws the selected More item with the %s glyph and the More chevron', (moreTabItemID, glyphName) => {
        // Given the flat nav bar while the user is on a page picked from the More menu
        const {result} = renderHook(() => ({options: useNativeTabBarOptions(FLAT_NAV_PARAMS), theme: useTheme()}));

        // When the More item options are built
        const options = result.current.options.getTabOptions(SCREENS.NATIVE_TAB_ITEM.MORE, moreTabItemID);
        const getParams = mockGetTabBarIcon.mock.calls.at(-1)?.[1];

        // Then its selected icon draws the glyph of that page with the chevron in the inactive color, as in the design,
        // and keeps the More label and the Workspaces dot, since the item still opens the More menu
        expect(getParams?.(true)).toMatchObject({
            name: glyphName,
            color: result.current.theme.iconMenu,
            dotColor: FLAT_NAV_PARAMS.dotColors[SCREENS.NATIVE_TAB_ITEM.MORE],
            accessory: {name: FLAT_NAV_TAB_BAR_SLOT.MORE, color: result.current.theme.icon},
        });
        expect(options[labelOption]).toBe('More');
    });

    it('draws the unselected More item with its own glyph while the user is on a picked entry', () => {
        // Given the flat nav bar while the user is on Workspaces, picked from the More menu
        const {result} = renderHook(() => ({options: useNativeTabBarOptions(FLAT_NAV_PARAMS), theme: useTheme()}));

        // When the More item options are built
        result.current.options.getTabOptions(SCREENS.NATIVE_TAB_ITEM.MORE, MORE_MENU.ITEM.WORKSPACES);
        const params = mockGetTabBarIcon.mock.calls.at(-1)?.[1]?.(false);

        // Then its unselected icon draws the More glyph alone in the room of the chevron, so a tap on another item swaps
        // the icons natively, as the selection moves, before JS has caught up with the tap
        expect(params).toMatchObject({name: FLAT_NAV_TAB_BAR_SLOT.MORE, color: result.current.theme.icon, reservesAccessory: true});
        expect(params?.accessory).toBeUndefined();
    });

    it('ignores the More menu entry for every item but More', () => {
        // Given the flat nav bar
        const {result} = renderHook(() => useNativeTabBarOptions(FLAT_NAV_PARAMS));

        // When the Expenses item options are built with a More menu entry
        result.current.getTabOptions(SCREENS.NATIVE_TAB_ITEM.EXPENSES, MORE_MENU.ITEM.WORKSPACES);
        const params = mockGetTabBarIcon.mock.calls.at(-1)?.[1]?.(false);

        // Then it keeps the glyph of its own slot, so only the More item ever changes its glyph
        expect(params).toMatchObject({name: FLAT_NAV_TAB_BAR_SLOT.EXPENSES});
        expect(params?.accessory).toBeUndefined();
    });
});

describe('iOS useNativeTabBarOptions labels', () => {
    beforeEach(() => {
        mockGetTabBarIcon.mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('draws the labels into the icons on iOS 26', () => {
        // Given iOS 26, whose bar ignores the title colors
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue('26.0');
        const {result} = renderHook(() => useIOSNativeTabBarOptions(PARAMS));

        // When the Inbox tab options are built
        const options = result.current.getTabOptions(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        const getParams = mockGetTabBarIcon.mock.calls.at(-1)?.[1];

        // Then the label is drawn into the icon and UIKit gets no title of its own
        expect(result.current.screenOptions.tabBarLabel).toBe('');
        expect(options.tabBarLabel).toBeUndefined();
        expect(getParams?.(false).label?.text).toBe('Inbox');
    });

    it('lets UIKit lay out the labels on iOS 18 and below', () => {
        // Given iOS 16, whose classic bar squeezes wide tab images into a small slot in landscape
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue('16.7');
        const {result} = renderHook(() => useIOSNativeTabBarOptions(PARAMS));

        // When the Inbox tab options are built
        const options = result.current.getTabOptions(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        const getParams = mockGetTabBarIcon.mock.calls.at(-1)?.[1];

        // Then UIKit gets the real title and the icon holds only the glyph, so the label keeps its size
        expect(result.current.screenOptions.tabBarLabel).toBeUndefined();
        expect(options.tabBarLabel).toBe('Inbox');
        expect(getParams?.(false).label).toBeUndefined();
    });

    it.each([
        ['26.0', 'beside'],
        ['16.7', 'corner'],
    ])('places the More chevron for iOS %s', (version, expectedPlacement) => {
        // Given the flat nav bar on an iOS version with or without the liquid glass bar
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(version);
        const {result} = renderHook(() => useIOSNativeTabBarOptions(FLAT_NAV_PARAMS));

        // When the More item options are built while the user is on Workspaces
        result.current.getTabOptions(SCREENS.NATIVE_TAB_ITEM.MORE, MORE_MENU.ITEM.WORKSPACES);
        const layout = mockGetTabBarIcon.mock.calls.at(-1)?.[0];

        // Then the liquid glass bar gets the chevron beside the glyph, as in the design, and the classic bar gets it over
        // the glyph's corner, since the classic bar squeezes a wider icon
        expect(layout?.accessoryPlacement).toBe(expectedPlacement);
    });

    it('places the More chevron over the glyph corner in the vertical bar on iOS 26', () => {
        // Given the flat nav bar laid out as a column, as on a foldable iPhone, on iOS 26
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue('26.0');
        const {result} = renderHook(() => useIOSNativeTabBarOptions({...FLAT_NAV_PARAMS, isTabBarVertical: true}));

        // When the More item options are built while the user is on Workspaces
        result.current.getTabOptions(SCREENS.NATIVE_TAB_ITEM.MORE, MORE_MENU.ITEM.WORKSPACES);
        const layout = mockGetTabBarIcon.mock.calls.at(-1)?.[0];

        // Then the chevron goes over the glyph's corner, since the column has no label to center the glyph over and a
        // chevron beside it would make the More icon more than twice as wide as the others
        expect(layout?.accessoryPlacement).toBe('corner');
    });
});

describe('Android useNativeTabBarOptions More chevron', () => {
    beforeEach(() => {
        mockGetTabBarIcon.mockClear();
    });

    it('places the More chevron at the right edge of the selected pill', () => {
        // Given the flat nav bar on Android
        const {result} = renderHook(() => useAndroidNativeTabBarOptions(FLAT_NAV_PARAMS));

        // When the More item options are built while the user is on Workspaces
        result.current.getTabOptions(SCREENS.NATIVE_TAB_ITEM.MORE, MORE_MENU.ITEM.WORKSPACES);
        const layout = mockGetTabBarIcon.mock.calls.at(-1)?.[0];

        // Then the chevron sits at the pill's edge, clear of the glyph and its status dot, rather than over the glyph
        expect(layout).toMatchObject({accessoryPlacement: 'pillEdge', pillWidth: variables.androidNativeTabBarActiveIndicatorWidth});
    });
});
