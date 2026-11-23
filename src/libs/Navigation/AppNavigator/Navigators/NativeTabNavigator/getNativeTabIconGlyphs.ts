/**
 * The glyphs a native tab bar item draws. The More item of the flat nav bar draws the glyph of the More menu entry the
 * user is on, with the More chevron beside it, and its own chevron alone otherwise.
 */
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import type {MoreMenuItemID} from '@libs/Navigation/MoreMenu/getMoreTabItemID';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeTabGlyphName} from './NATIVE_TAB_GLYPHS';
import type {NativeTabRouteName} from './nativeTabItemUtils';

import {getNativeTabGlyphName} from './nativeTabItemUtils';

type NativeTabIconGlyphs = {
    name: NativeTabGlyphName;
    accessoryName?: NativeTabGlyphName;
};

const MORE_TAB_ITEM_GLYPH_NAMES = {
    [MORE_MENU.ITEM.ACCOUNTING]: MORE_MENU.ITEM.ACCOUNTING,
    [MORE_MENU.ITEM.SAVED]: MORE_MENU.ITEM.SAVED,
    [MORE_MENU.ITEM.INSIGHTS]: SCREENS.INSIGHTS,
    [MORE_MENU.ITEM.WORKSPACES]: NAVIGATORS.WORKSPACE_NAVIGATOR,
} as const satisfies Record<MoreMenuItemID, NativeTabGlyphName>;

/**
 * @param moreTabItemID - the More menu entry the More item shows, from getMoreTabItemID. Ignored for every other item.
 */
function getNativeTabIconGlyphs(routeName: NativeTabRouteName, moreTabItemID: MoreMenuItemID | undefined): NativeTabIconGlyphs {
    if (routeName === SCREENS.NATIVE_TAB_ITEM.MORE && moreTabItemID) {
        return {name: MORE_TAB_ITEM_GLYPH_NAMES[moreTabItemID], accessoryName: FLAT_NAV_TAB_BAR_SLOT.MORE};
    }
    return {name: getNativeTabGlyphName(routeName)};
}

export default getNativeTabIconGlyphs;
