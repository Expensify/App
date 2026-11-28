/**
 * The glyphs a native tab bar item draws. The More item of the flat nav bar draws the glyph of the More menu entry the
 * user is on, with the More chevron beside it, and its own chevron alone otherwise.
 */
import FLAT_NAV_TAB_BAR_SLOT from '@libs/Navigation/FlatNavTabBar/FLAT_NAV_TAB_BAR_SLOT';
import type {MoreMenuItemID} from '@libs/Navigation/MoreMenu/MORE_MENU';
import MORE_MENU from '@libs/Navigation/MoreMenu/MORE_MENU';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeTabGlyphName} from './NATIVE_TAB_GLYPHS';
import type {NativeTabRouteName} from './nativeTabItemUtils';

import {getNativeTabGlyphName} from './nativeTabItemUtils';

type NativeTabIconGlyphs = {
    name: NativeTabGlyphName;
    accessoryName?: NativeTabGlyphName;
    /** Whether the item keeps room for an accessory it does not draw, as the More item does without a picked entry */
    reservesAccessory?: boolean;
};

const MORE_TAB_ITEM_GLYPH_NAMES = {
    [MORE_MENU.ITEM.ACCOUNTING]: MORE_MENU.ITEM.ACCOUNTING,
    [MORE_MENU.ITEM.SAVED]: MORE_MENU.ITEM.SAVED,
    [MORE_MENU.ITEM.INSIGHTS]: SCREENS.INSIGHTS,
    [MORE_MENU.ITEM.WORKSPACES]: NAVIGATORS.WORKSPACE_NAVIGATOR,
} as const satisfies Record<MoreMenuItemID, NativeTabGlyphName>;

/**
 * @param moreTabItemID - the More menu entry the More item shows, from getMoreTabItemID. Ignored for every other item.
 * @param isSelected - whether the glyphs are for the item's selected icon. The More item shows its entry only in that
 * icon, so a tap on another item swaps it for the chevron natively, in the frame the selection moves, rather than once
 * JS has caught up with the tap.
 */
function getNativeTabIconGlyphs(routeName: NativeTabRouteName, moreTabItemID: MoreMenuItemID | undefined, isSelected: boolean): NativeTabIconGlyphs {
    if (routeName === SCREENS.NATIVE_TAB_ITEM.MORE && moreTabItemID && isSelected) {
        return {name: MORE_TAB_ITEM_GLYPH_NAMES[moreTabItemID], accessoryName: FLAT_NAV_TAB_BAR_SLOT.MORE};
    }
    // The iOS 26 bar sizes its items to their icons, so the More item keeps the chevron's room and the bar does not shift
    // when the item switches between its own glyph and a picked entry.
    if (routeName === SCREENS.NATIVE_TAB_ITEM.MORE) {
        return {name: getNativeTabGlyphName(routeName), reservesAccessory: true};
    }
    return {name: getNativeTabGlyphName(routeName)};
}

export default getNativeTabIconGlyphs;
