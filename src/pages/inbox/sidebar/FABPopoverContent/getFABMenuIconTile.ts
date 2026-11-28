/** Picks the colored tile, and the icon drawn on it, for each create menu row in the flat navigation. */
import type {ExpensifyIconName} from '@components/Icon/chunks/expensify-icons.chunk';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import type {QuickActionName} from '@src/types/onyx/QuickAction';

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

type FABMenuTileColors = Pick<FABMenuIconTile, 'tileColor' | 'iconColor'>;

const EXPENSE_TILE_COLORS: FABMenuTileColors = {tileColor: colors.green700, iconColor: colors.green200};
const TRACK_DISTANCE_TILE_COLORS: FABMenuTileColors = {tileColor: colors.pink700, iconColor: colors.pink200};
const NEW_CHAT_TILE_COLORS: FABMenuTileColors = {tileColor: colors.yellow600, iconColor: colors.yellow100};

function getQuickActionTileColors(quickAction: QuickActionName | undefined): FABMenuTileColors {
    switch (quickAction) {
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return TRACK_DISTANCE_TILE_COLORS;
        // There is no task row, and a task is assigned in a chat
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return NEW_CHAT_TILE_COLORS;
        default:
            return EXPENSE_TILE_COLORS;
    }
}

function getFABMenuIconTile(itemID: string, quickAction?: QuickActionName): FABMenuIconTile | undefined {
    switch (itemID) {
        case CONST.FAB_MENU_ITEM_IDS.EXPENSE:
            return {...EXPENSE_TILE_COLORS, iconName: 'ReceiptMultiple'};
        case CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION:
            return {...getQuickActionTileColors(quickAction), shouldShowDividerAbove: true};
        case CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT:
            return {tileColor: colors.blue700, iconColor: colors.blue200, iconName: 'Document'};
        case CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE:
            return {...TRACK_DISTANCE_TILE_COLORS, iconName: 'Location'};
        case CONST.FAB_MENU_ITEM_IDS.NEW_CHAT:
            return {...NEW_CHAT_TILE_COLORS, iconName: 'CommentBubbles'};
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
