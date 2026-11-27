/** Picks the colored tile, and the icon drawn on it, for each create menu row in the flat navigation. */
import type {ExpensifyIconName} from '@components/Icon/chunks/expensify-icons.chunk';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

/** Every icon a tile can draw, so the menu loads them all at once */
const FAB_MENU_TILE_ICON_NAMES = ['ReceiptMultiple', 'Document', 'Location', 'CommentBubbles', 'InvoiceGeneric', 'LuggageWithLines', 'Building'] as const satisfies ExpensifyIconName[];

type FABMenuTileIconName = TupleToUnion<typeof FAB_MENU_TILE_ICON_NAMES>;

type FABMenuIconTile = {
    /** Color of the square behind the icon */
    tileColor: string;

    /** Color of the icon on top of the tile */
    iconColor: string;

    /** Icon the design draws on the tile, or undefined to keep the icon the row passes in */
    iconName?: FABMenuTileIconName;

    /** Whether a divider line sits above the row, to set it apart from the create actions */
    shouldShowDividerAbove?: boolean;
};

function getFABMenuIconTile(itemID: string): FABMenuIconTile | undefined {
    switch (itemID) {
        case CONST.FAB_MENU_ITEM_IDS.EXPENSE:
            return {tileColor: colors.green700, iconColor: colors.green200, iconName: 'ReceiptMultiple'};
        case CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION:
            return {tileColor: colors.green700, iconColor: colors.green200, shouldShowDividerAbove: true};
        case CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT:
            return {tileColor: colors.blue700, iconColor: colors.blue200, iconName: 'Document'};
        case CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE:
            return {tileColor: colors.pink700, iconColor: colors.pink200, iconName: 'Location'};
        case CONST.FAB_MENU_ITEM_IDS.NEW_CHAT:
            return {tileColor: colors.yellow600, iconColor: colors.yellow100, iconName: 'CommentBubbles'};
        case CONST.FAB_MENU_ITEM_IDS.INVOICE:
            return {tileColor: colors.ice700, iconColor: colors.ice200, iconName: 'InvoiceGeneric'};
        case CONST.FAB_MENU_ITEM_IDS.TRAVEL:
            return {tileColor: colors.tangerine700, iconColor: colors.tangerine200, iconName: 'LuggageWithLines'};
        case CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE:
            return {tileColor: colors.green500, iconColor: colors.green200, iconName: 'Building', shouldShowDividerAbove: true};
        default:
            return undefined;
    }
}

export default getFABMenuIconTile;
export {FAB_MENU_TILE_ICON_NAMES};
export type {FABMenuIconTile};
