import getNativeTabBarItems from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/getNativeTabBarItems';
import {NATIVE_TAB_ITEM_KINDS} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/** Route order of the native TabNavigator, which decides the order of the visible items. */
const NATIVE_TAB_ROUTE_ORDER = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    SCREENS.NATIVE_TAB_ITEM.EXPENSES,
    SCREENS.NATIVE_TAB_ITEM.REPORTS_BEFORE_SPEND,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.NATIVE_TAB_ITEM.REPORTS_AFTER_SPEND,
    SCREENS.INSIGHTS,
    SCREENS.MORE,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
];

const EXPECTED_KINDS = [NATIVE_TAB_ITEM_KINDS.HOME, NATIVE_TAB_ITEM_KINDS.INBOX, NATIVE_TAB_ITEM_KINDS.EXPENSES, NATIVE_TAB_ITEM_KINDS.REPORTS, NATIVE_TAB_ITEM_KINDS.MORE];

function getVisibleItems(focusedRouteName: string, spendSearchKey: string | undefined) {
    const items = getNativeTabBarItems(focusedRouteName, spendSearchKey);
    return NATIVE_TAB_ROUTE_ORDER.flatMap((routeName) => {
        const item = items[routeName];
        return item ? [{routeName, ...item}] : [];
    });
}

describe('getNativeTabBarItems', () => {
    it.each([
        ['Home with Spend on Expenses', SCREENS.HOME, CONST.SEARCH.SEARCH_KEYS.EXPENSES],
        ['Spend on Expenses', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.EXPENSES],
        ['Spend on Reports', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.APPROVE],
        ['Spend on Accounting', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.EXPORT],
        ['Spend on a saved search', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, savedSearchIDToSearchKey('1')],
        ['More with Spend on Accounting', SCREENS.MORE, CONST.SEARCH.SEARCH_KEYS.EXPORT],
        ['Workspaces with Spend on Reports', NAVIGATORS.WORKSPACE_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.REPORTS],
        ['Insights with Spend on Accounting', SCREENS.INSIGHTS, CONST.SEARCH.SEARCH_KEYS.EXPORT],
    ])('shows Home, Inbox, Expenses, Reports and More in order: %s', (_, focusedRouteName, spendSearchKey) => {
        // Given the focused tab and the search the Spend route shows

        // When the bar's items are worked out
        const visibleItems = getVisibleItems(focusedRouteName, spendSearchKey);

        // Then the bar always has the five slots of the design in the same order, since Android's bar holds at most five
        expect(visibleItems.map((item) => item.kind)).toEqual(EXPECTED_KINDS);

        // And the focused route always has an item, so it is never drawn over the tabs with the bar hidden
        expect(visibleItems.some((item) => item.routeName === focusedRouteName)).toBe(true);
    });

    it('puts Spend in the Reports slot while it shows a Reports search', () => {
        // Given Spend shows the Reports search
        const items = getNativeTabBarItems(SCREENS.HOME, CONST.SEARCH.SEARCH_KEYS.REPORTS);

        // When the bar is drawn

        // Then Spend itself is the Reports item, and the bar may switch to it because it already shows that search
        expect(items[NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]).toEqual({kind: NATIVE_TAB_ITEM_KINDS.REPORTS, isNativeSelectionEnabled: true});
    });

    it('lets JS open Reports when Spend shows another search of the Reports group', () => {
        // Given Spend shows the Approve search, which sits in the Reports slot but is not what the Reports tab opens
        const items = getNativeTabBarItems(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.APPROVE);

        // When the bar is drawn

        // Then a tap on Reports is left to JS, which opens Reports the same way the JS tab bar does, instead of being a no-op repeat tap
        expect(items[NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]).toEqual({kind: NATIVE_TAB_ITEM_KINDS.REPORTS, isNativeSelectionEnabled: false});
    });

    it('lets JS decide what the More slot opens when Spend fills it', () => {
        // Given Spend last showed an Accounting search while Home is open
        const items = getNativeTabBarItems(SCREENS.HOME, CONST.SEARCH.SEARCH_KEYS.EXPORT);

        // When the bar is drawn

        // Then Spend fills the More slot but a tap goes through JS, so it opens what the JS More tab would
        expect(items[NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]).toEqual({kind: NATIVE_TAB_ITEM_KINDS.MORE, isNativeSelectionEnabled: false});
    });

    it('lets JS open Expenses when Spend fills the Expenses slot but still shows an Accounting search', () => {
        // Given Workspaces owns the More slot while Spend last showed an Accounting search
        const items = getNativeTabBarItems(NAVIGATORS.WORKSPACE_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.EXPORT);

        // When the bar is drawn

        // Then Spend is labeled Expenses but may not be switched to natively, or the tap would land on Accounting
        expect(items[NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]).toEqual({kind: NATIVE_TAB_ITEM_KINDS.EXPENSES, isNativeSelectionEnabled: false});
    });

    it('never gives Account an item', () => {
        // Given Account is open
        const items = getNativeTabBarItems(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

        // When the bar is drawn

        // Then Account has no item, because it opens from the top bar and is drawn over the tabs
        expect(items[NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]).toBeUndefined();
    });
});
