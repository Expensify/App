/** The side panel's committed width on a wide layout, clamped to the bounds the window and the RHP beside it allow. */
import useNavigationBarWidth from '@components/Navigation/FlatNavigationBar/useNavigationBarWidth';

import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

import useIsWideRHPDisplayed from './useIsWideRHPDisplayed';
import usePaneWidth from './usePaneWidth';
import usePermissions from './usePermissions';
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
    const navigationBarWidth = useNavigationBarWidth();

    // Only an extra large window docks the panel. A smaller one floats it over the page, which leaves the page and the RHP where they are.
    const bounds = getSidePanelWidthBounds(windowWidth, isExtraLargeScreenWidth ? {navigationBarWidth, isWideRHPDisplayed} : undefined);
    const width = usePaneWidth(ONYXKEYS.SIDE_PANEL_WIDTH, variables.resizableSidePanelDefaultWidth, bounds);
    const {isBetaEnabled} = usePermissions();
    const isResizable = isBetaEnabled(CONST.BETAS.RESIZABLE_SIDE_PANEL);

    // Outside the beta the panel keeps its fixed width, even when a width was saved while the beta was on.
    return {width: isResizable ? width : variables.sidePanelWidth, bounds, isResizable};
}

export default useSidePanelWidth;
