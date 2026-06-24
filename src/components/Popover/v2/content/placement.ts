import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

type PopoverPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

const DEFAULT_OFFSET_PX = 8;
const DEFAULT_PLACEMENT: PopoverPlacement = 'bottom-start';

function placementToAlignment(placement: PopoverPlacement): AnchorAlignment {
    const [side, align] = placement.split('-');
    const vertical = side === 'top' ? CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM : CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP;
    const horizontal = align === 'end' ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT;
    return {horizontal, vertical};
}

export {DEFAULT_OFFSET_PX, DEFAULT_PLACEMENT, placementToAlignment};
export type {PopoverPlacement};
