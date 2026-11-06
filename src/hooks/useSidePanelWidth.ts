/** The side panel's committed width on a wide layout, clamped to the bounds the window and the RHP beside it allow. */
import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

import useIsWideRHPDisplayed from './useIsWideRHPDisplayed';
import usePaneWidth from './usePaneWidth';
import useResponsiveLayout from './useResponsiveLayout';
import useWindowDimensions from './useWindowDimensions';

type SidePanelWidth = {
    width: number;
    bounds: PaneWidthBounds;
    isResizable: boolean;
};

/** Clamped rather than saved, so the dragged width comes back once the wide RHP closes. */
function useSidePanelWidth(): SidePanelWidth {
    const {windowWidth} = useWindowDimensions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const isWideRHPDisplayed = useIsWideRHPDisplayed();

    // Only a docked panel shifts the RHP. One floating over the page leaves it where it is.
    const bounds = getSidePanelWidthBounds(windowWidth, isExtraLargeScreenWidth && isWideRHPDisplayed);
    const {width, isResizable} = usePaneWidth(ONYXKEYS.SIDE_PANEL_WIDTH, CONST.BETAS.RESIZABLE_SIDE_PANEL, variables.resizableSidePanelDefaultWidth, bounds);

    // Outside the beta the panel keeps its fixed width.
    return {width: isResizable ? width : variables.sidePanelWidth, bounds, isResizable};
}

export default useSidePanelWidth;
