/** How narrow and how wide the single RHP can be dragged in a given window. */
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET, {RHP_FLOATING_CARD_BORDERS_WIDTH} from '@libs/Navigation/helpers/rhpFloatingCardInset';

import CONST from '@src/CONST';
import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

function getSingleRHPWidthBounds(windowWidth: number, sidePanelWidth: number): PaneWidthBounds {
    const min = CONST.RHP_RESIZE.MIN_WIDTH;
    // The bounds are the card's content width, so its borders come off too, or the card ends up closer than the inset to a wide card's edge.
    const widthBelowWideRHP = calculateWideRHPWidth(windowWidth) - CONST.RHP_RESIZE.WIDE_RHP_INSET - RHP_FLOATING_CARD_BORDERS_WIDTH;
    const widthLeftForCard = windowWidth - RHP_FLOATING_CARD_INSET - sidePanelWidth - CONST.RHP_RESIZE.CONTENT_RESERVE_WIDTH;

    return {min, max: Math.max(min, Math.min(widthBelowWideRHP, widthLeftForCard))};
}

export default getSingleRHPWidthBounds;
