/** How narrow and how wide the Side Panel can be dragged in a given window. */
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';

import variables from '@styles/variables';

import CONST from '@src/CONST';

type SidePanelWidthBounds = {
    min: number;
    max: number;
};

/** While a wide RHP is open, the docked panel pushes it left, so the panel stays narrow enough for the card to clear the navigation tab bar. */
function getSidePanelWidthBounds(windowWidth: number, isWideRHPOpen: boolean): SidePanelWidthBounds {
    const min = CONST.SIDE_PANEL_RESIZE.MIN_WIDTH;
    const widthLeftForPanel = windowWidth - variables.navigationTabBarSize - CONST.SIDE_PANEL_RESIZE.CONTENT_RESERVE_WIDTH;
    const widthBesideWideRHP = windowWidth - variables.navigationTabBarSize - variables.rhpFloatingCardMargin - RHP_FLOATING_CARD_INSET - calculateWideRHPWidth(windowWidth);
    const max = isWideRHPOpen ? Math.min(widthLeftForPanel, widthBesideWideRHP) : widthLeftForPanel;

    return {min, max: Math.max(min, max)};
}

export default getSidePanelWidthBounds;
export type {SidePanelWidthBounds};
