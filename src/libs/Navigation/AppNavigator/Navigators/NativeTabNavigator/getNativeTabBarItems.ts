import {isSearchBehindMore, REPORTS_KEYS} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeTabItemKind} from './NATIVE_TAB_GLYPHS';

import {NATIVE_TAB_ITEM_KINDS} from './NATIVE_TAB_GLYPHS';

/** Which slot of the bar the Spend route fills, decided by the search it shows. */
type SpendSlot = typeof NATIVE_TAB_ITEM_KINDS.EXPENSES | typeof NATIVE_TAB_ITEM_KINDS.REPORTS | typeof NATIVE_TAB_ITEM_KINDS.MORE;

type NativeTabBarItem = {
    kind: NativeTabItemKind;

    /**
     * Whether the native bar may switch to this route itself. When false, a tap is handled in JS: the item-only tabs
     * have nothing to show, and a slot whose route shows something else than its label must navigate first.
     */
    isNativeSelectionEnabled: boolean;
};

/** Routes reached through More. The one in focus takes the More slot, so the bar keeps More lit while it is open. */
const MORE_DESTINATION_ROUTES = new Set<string>([SCREENS.MORE, SCREENS.INSIGHTS, NAVIGATORS.WORKSPACE_NAVIGATOR]);

/** The slot a Spend search belongs to: its own group's tab, or More for the groups that live behind it. */
function getSpendSlot(searchKey: string | undefined): SpendSlot {
    if (isSearchBehindMore(searchKey)) {
        return NATIVE_TAB_ITEM_KINDS.MORE;
    }
    if (REPORTS_KEYS.some((key) => key === searchKey)) {
        return NATIVE_TAB_ITEM_KINDS.REPORTS;
    }
    return NATIVE_TAB_ITEM_KINDS.EXPENSES;
}

/**
 * The native bar has one item per route, but the narrow design has separate Expenses and Reports tabs over the single
 * Spend route, and a More tab standing in for several routes. So the bar always shows exactly five items: Home, Inbox,
 * Expenses, Reports and More, and the routes take turns filling them.
 *
 * The Spend route fills the slot of the search it shows. Item-only routes placed before and after it fill the slots it
 * leaves, so the five items keep their order whichever slot Spend is in. The More slot goes to whichever More
 * destination is focused, so the focused route always has an item. Account is never in the bar: it opens from the top
 * bar and is drawn over the tabs.
 *
 * Returns undefined for a route that has no item.
 */
function getNativeTabBarItems(focusedRouteName: string | undefined, spendSearchKey: string | undefined): Record<string, NativeTabBarItem | undefined> {
    const spendContentSlot = getSpendSlot(spendSearchKey);
    const isMoreDestinationFocused = !!focusedRouteName && MORE_DESTINATION_ROUTES.has(focusedRouteName);
    // While a More destination is focused it owns the More slot, so Spend falls back to Expenses and a tap on it
    // has to open Expenses rather than whatever the route last showed.
    const spendSlot = isMoreDestinationFocused && spendContentSlot === NATIVE_TAB_ITEM_KINDS.MORE ? NATIVE_TAB_ITEM_KINDS.EXPENSES : spendContentSlot;
    let moreSlotRoute: string | undefined = SCREENS.MORE;
    if (isMoreDestinationFocused) {
        moreSlotRoute = focusedRouteName;
    } else if (spendSlot === NATIVE_TAB_ITEM_KINDS.MORE) {
        moreSlotRoute = undefined;
    }

    // The bar may only switch to Spend itself when it already shows the exact search its item opens. Any other search in
    // that slot, and every search in the More slot, goes through JS so the tap lands where the JS tab bar would.
    const isSpendShowingItsSlot =
        (spendSlot === NATIVE_TAB_ITEM_KINDS.EXPENSES && spendSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES) ||
        (spendSlot === NATIVE_TAB_ITEM_KINDS.REPORTS && spendSearchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS);
    const itemOnly = (kind: NativeTabItemKind, isShown: boolean) => (isShown ? {kind, isNativeSelectionEnabled: false} : undefined);
    const moreDestination = (routeName: string) => (moreSlotRoute === routeName ? {kind: NATIVE_TAB_ITEM_KINDS.MORE, isNativeSelectionEnabled: false} : undefined);

    return {
        [SCREENS.HOME]: {kind: NATIVE_TAB_ITEM_KINDS.HOME, isNativeSelectionEnabled: true},
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: {kind: NATIVE_TAB_ITEM_KINDS.INBOX, isNativeSelectionEnabled: true},
        [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: itemOnly(NATIVE_TAB_ITEM_KINDS.EXPENSES, spendSlot !== NATIVE_TAB_ITEM_KINDS.EXPENSES),
        [SCREENS.NATIVE_TAB_ITEM.REPORTS_BEFORE_SPEND]: itemOnly(NATIVE_TAB_ITEM_KINDS.REPORTS, spendSlot === NATIVE_TAB_ITEM_KINDS.MORE),
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: {kind: spendSlot, isNativeSelectionEnabled: isSpendShowingItsSlot},
        [SCREENS.NATIVE_TAB_ITEM.REPORTS_AFTER_SPEND]: itemOnly(NATIVE_TAB_ITEM_KINDS.REPORTS, spendSlot === NATIVE_TAB_ITEM_KINDS.EXPENSES),
        [SCREENS.MORE]: moreDestination(SCREENS.MORE),
        [SCREENS.INSIGHTS]: moreDestination(SCREENS.INSIGHTS),
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: moreDestination(NAVIGATORS.WORKSPACE_NAVIGATOR),
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: undefined,
    };
}

export default getNativeTabBarItems;
export type {NativeTabBarItem};
