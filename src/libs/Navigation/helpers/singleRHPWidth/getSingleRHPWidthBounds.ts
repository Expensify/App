/** How narrow and how wide the single RHP can be dragged in a given window. */
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';

import CONST from '@src/CONST';

type SingleRHPWidthBounds = {
    min: number;
    max: number;
};

function getSingleRHPWidthBounds(windowWidth: number, sidePanelWidth: number): SingleRHPWidthBounds {
    const min = CONST.RHP_RESIZE.MIN_WIDTH;
    const widthBelowWideRHP = calculateWideRHPWidth(windowWidth) - CONST.RHP_RESIZE.WIDE_RHP_INSET;
    const widthLeftForCard = windowWidth - RHP_FLOATING_CARD_INSET - sidePanelWidth - CONST.RHP_RESIZE.CONTENT_RESERVE_WIDTH;

    return {min, max: Math.max(min, Math.min(widthBelowWideRHP, widthLeftForCard))};
}

export default getSingleRHPWidthBounds;
export type {SingleRHPWidthBounds};
