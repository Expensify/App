/** The single RHP's committed width, clamped to the bounds the window allows. */
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';
import type {SingleRHPWidthBounds} from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import usePaneWidth from './usePaneWidth';
import useResponsiveLayout from './useResponsiveLayout';
import useSidePanelState from './useSidePanelState';
import useWindowDimensions from './useWindowDimensions';

type SingleRHPWidth = SingleRHPWidthBounds & {
    width: number;
};

function useSingleRHPWidth(): SingleRHPWidth {
    const {windowWidth} = useWindowDimensions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {shouldHideSidePanel} = useSidePanelState();

    // Mirrors when SidePanelContextProvider shifts the RHP left by the panel's width.
    const bounds = getSingleRHPWidthBounds(windowWidth, isExtraLargeScreenWidth && !shouldHideSidePanel ? variables.sidePanelWidth : 0);
    const width = usePaneWidth(ONYXKEYS.SINGLE_RHP_WIDTH, CONST.BETAS.RESIZABLE_RHP, variables.rhpWidth, bounds);

    return {...bounds, width};
}

export default useSingleRHPWidth;
