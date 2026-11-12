/** How narrow and how wide the side panel can be dragged in a given window. */
import {WIDEST_SPLIT_NAVIGATOR_SIDEBAR_WIDTH} from '@libs/Navigation/AppNavigator/getSplitNavigatorSidebarWidth';
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

/** What sits beside a docked panel. A floating panel overlays the page, so none of it limits the panel. */
type DockedSidePanelLayout = {
    navigationBarWidth: number;
    isWideRHPDisplayed: boolean;
};

/**
 * Never narrower than the fixed panel, and never wider than a single RHP can be dragged in the same window, so the two panes resize alike.
 * A docked panel takes its width from the page, so it also leaves the central pane beside the navigation bar and the widest LHN its minimum width.
 * The LHN width is the widest one rather than the current one, so the panel keeps its width when switching tabs.
 * A docked panel shifts the RHP left by its width, so beside a wide RHP it also leaves room for the wide card to stay on screen.
 * The super wide RHP gives up width to the panel down to the wide width, so the same room keeps it on screen too.
 */
function getSidePanelWidthBounds(windowWidth: number, dockedLayout?: DockedSidePanelLayout): PaneWidthBounds {
    const min = variables.sidePanelWidth;
    const {max: singleRHPMaxWidth} = getSingleRHPWidthBounds(windowWidth, 0);
    const widthBesideCentralPane = dockedLayout ? windowWidth - dockedLayout.navigationBarWidth - WIDEST_SPLIT_NAVIGATOR_SIDEBAR_WIDTH - variables.centralPaneMinWidth : Infinity;
    const widthBesideWideRHP = dockedLayout?.isWideRHPDisplayed ? windowWidth - RHP_FLOATING_CARD_INSET - calculateWideRHPWidth(windowWidth) : Infinity;

    return {min, max: Math.max(min, Math.min(singleRHPMaxWidth, widthBesideCentralPane, widthBesideWideRHP))};
}

export default getSidePanelWidthBounds;
