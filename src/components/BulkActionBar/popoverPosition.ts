import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

/**
 * The bar floats at the bottom of its container, so both of its menus open upwards (`BOTTOM` anchors the menu to the
 * top edge of the button). An action's sub-menu lines up with the left edge of its own button, while the "More" menu
 * lines up with the right edge of the bar's last button so it stays inside the bar's width.
 */
const SUB_MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

const MORE_MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

// In tests, skip the popover anchor position calculation. The default values are needed for popover menu to be rendered in tests.
const defaultPopoverAnchorPosition: AnchorPosition | null = process.env.NODE_ENV === 'test' ? {horizontal: 100, vertical: 100} : null;

export {SUB_MENU_ANCHOR_ALIGNMENT, MORE_MENU_ANCHOR_ALIGNMENT, defaultPopoverAnchorPosition};
