/**
 * The placeholder items of the flat nav native tab bar. Expenses, Reports and More are tabs of their own in the native
 * bar, but no screen is behind them: the Search, Insights and Workspaces routes are hidden from the bar and drawn
 * inside the placeholder of their slot, which the bar then shows as selected.
 */
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import type {FlatNavTabBarSlot} from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import getFlatNavTabBarSlot from '@libs/Navigation/FlatNavTabBar/getFlatNavTabBarSlot';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {isSearchRootParams} from '@libs/SearchQueryUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';

import type {NativeTabGlyphName, NativeTabName} from './NATIVE_TAB_GLYPHS';

type NativeTabItemName = ValueOf<typeof SCREENS.NATIVE_TAB_ITEM>;

/** A route that can have an item in the native tab bar. */
type NativeTabRouteName = NativeTabName | NativeTabItemName;

const NATIVE_TAB_ITEM_SLOTS = {
    [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: FLAT_NAV_TAB_BAR_SLOT.EXPENSES,
    [SCREENS.NATIVE_TAB_ITEM.REPORTS]: FLAT_NAV_TAB_BAR_SLOT.REPORTS,
    [SCREENS.NATIVE_TAB_ITEM.MORE]: FLAT_NAV_TAB_BAR_SLOT.MORE,
} as const satisfies Record<NativeTabItemName, FlatNavTabBarSlot>;

/** The visible tab that draws each slot of the flat nav bar. */
const SLOT_ROUTE_NAMES: Record<FlatNavTabBarSlot, NativeTabRouteName> = {
    [FLAT_NAV_TAB_BAR_SLOT.HOME]: SCREENS.HOME,
    [FLAT_NAV_TAB_BAR_SLOT.INBOX]: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    [FLAT_NAV_TAB_BAR_SLOT.EXPENSES]: SCREENS.NATIVE_TAB_ITEM.EXPENSES,
    [FLAT_NAV_TAB_BAR_SLOT.REPORTS]: SCREENS.NATIVE_TAB_ITEM.REPORTS,
    [FLAT_NAV_TAB_BAR_SLOT.MORE]: SCREENS.NATIVE_TAB_ITEM.MORE,
};

const NATIVE_TAB_ITEM_NAMES: ReadonlySet<string> = new Set(Object.values(SCREENS.NATIVE_TAB_ITEM));

function isNativeTabItemName(routeName: string): routeName is NativeTabItemName {
    return NATIVE_TAB_ITEM_NAMES.has(routeName);
}

/** Placeholders draw the glyph of their slot, every other tab the glyph of its route. */
function getNativeTabGlyphName(routeName: NativeTabRouteName): NativeTabGlyphName {
    return isNativeTabItemName(routeName) ? NATIVE_TAB_ITEM_SLOTS[routeName] : routeName;
}

/** A navigation to a placeholder, which the tab press handlers replace with their own navigation. */
function isNavigationToNativeTabItem(action: NavigationAction) {
    if (action.type !== 'NAVIGATE' && action.type !== 'JUMP_TO') {
        return false;
    }
    const payload: unknown = action.payload;
    return !!payload && typeof payload === 'object' && 'name' in payload && typeof payload.name === 'string' && isNativeTabItemName(payload.name);
}

/** The `searchKey` param of the search the Search tab route shows. Reads a partial cold start state too. */
function getSearchTabSearchKey(searchTabRoute: {state?: NavigationState | PartialState<NavigationState>} | undefined): SearchKey | undefined {
    const params = searchTabRoute?.state?.routes.findLast((searchRoute) => searchRoute.name === SCREENS.SEARCH.ROOT)?.params;
    return isSearchRootParams(params) ? params.searchKey : undefined;
}

/**
 * The placeholder a hidden tab route is drawn inside, or undefined for a route the flat nav bar has no slot for, such
 * as Account. Search takes the slot of its section, see useNativeFlatNavSearchSection.
 */
function getFlatNavTabHostRouteName(routeName: string, searchSectionID: FlatNavSectionID | undefined): NativeTabRouteName | undefined {
    const slot = getFlatNavTabBarSlot({focusedTabRouteName: routeName, activeFlatNavSectionID: searchSectionID});
    return slot ? SLOT_ROUTE_NAMES[slot] : undefined;
}

export {getFlatNavTabHostRouteName, getNativeTabGlyphName, getSearchTabSearchKey, isNativeTabItemName, isNavigationToNativeTabItem};
export type {NativeTabRouteName};
