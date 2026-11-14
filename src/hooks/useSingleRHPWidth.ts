/** The single RHP's committed width, clamped to the bounds the window allows. */
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

import usePaneWidth from './usePaneWidth';
import useResponsiveLayout from './useResponsiveLayout';
import useSidePanelState from './useSidePanelState';
import useWindowDimensions from './useWindowDimensions';

type SingleRHPWidth = {
    width: number;
    bounds: PaneWidthBounds;
};

function useSingleRHPWidth(): SingleRHPWidth {
    const {windowWidth} = useWindowDimensions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {shouldHideSidePanel, sidePanelWidth} = useSidePanelState();

    // Mirrors when SidePanelContextProvider shifts the RHP left by the panel's width.
    const bounds = getSingleRHPWidthBounds(windowWidth, isExtraLargeScreenWidth && !shouldHideSidePanel ? sidePanelWidth : 0);
    const width = usePaneWidth(ONYXKEYS.SINGLE_RHP_WIDTH, variables.rhpWidth, bounds);

    return {width, bounds};
}

export default useSingleRHPWidth;
