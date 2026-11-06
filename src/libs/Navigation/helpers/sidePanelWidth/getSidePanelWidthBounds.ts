/** How narrow and how wide the side panel can be dragged in a given window. */
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

/**
 * Never narrower than the fixed panel, and never wider than a single RHP can be dragged in the same window, so the two panes resize alike.
 * A docked panel shifts the RHP left by its width, so beside a wide RHP it also leaves room for the wide card to stay on screen.
 * The super wide RHP gives up width to the panel down to the wide width, so the same room keeps it on screen too.
 */
function getSidePanelWidthBounds(windowWidth: number, isWideRHPBesidePanel: boolean): PaneWidthBounds {
    const min = variables.sidePanelWidth;
    const {max: singleRHPMaxWidth} = getSingleRHPWidthBounds(windowWidth, 0);
    const widthBesideWideRHP = isWideRHPBesidePanel ? windowWidth - RHP_FLOATING_CARD_INSET - calculateWideRHPWidth(windowWidth) : Infinity;

    return {min, max: Math.max(min, Math.min(singleRHPMaxWidth, widthBesideWideRHP))};
}

export default getSidePanelWidthBounds;
