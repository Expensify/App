/** How narrow and how wide the side panel can be dragged in a given window. */
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

/** Never narrower than the default, and never wider than a single RHP can be dragged in the same window, so the two panes resize alike. */
function getSidePanelWidthBounds(windowWidth: number): PaneWidthBounds {
    const min = variables.sidePanelWidth;
    const {max: singleRHPMaxWidth} = getSingleRHPWidthBounds(windowWidth, 0);

    return {min, max: Math.max(min, singleRHPMaxWidth)};
}

export default getSidePanelWidthBounds;
