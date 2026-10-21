/** How narrow and how wide the single RHP can be dragged in a given window. */
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';

import variables from '@styles/variables';

import CONST from '@src/CONST';

type SingleRHPWidthBounds = {
    min: number;
    max: number;
};

/** The widest bound stays narrower than the wide RHP and leaves the content beside the card some room, but never drops below the narrowest one. */
function getSingleRHPWidthBounds(windowWidth: number, sidePanelWidth: number): SingleRHPWidthBounds {
    const min = CONST.RHP_RESIZE.MIN_WIDTH;
    const widthLeftForCard = windowWidth - variables.rhpFloatingCardMargin - 2 * variables.rhpFloatingCardBorderWidth - sidePanelWidth - CONST.RHP_RESIZE.CONTENT_RESERVE_WIDTH;

    return {min, max: Math.max(min, Math.min(calculateWideRHPWidth(windowWidth) - CONST.RHP_RESIZE.WIDE_RHP_INSET, widthLeftForCard))};
}

export default getSingleRHPWidthBounds;
export type {SingleRHPWidthBounds};
