/** The side panel's committed width on a wide layout, clamped to the bounds the window allows. */
import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

import usePaneWidth from './usePaneWidth';
import useWindowDimensions from './useWindowDimensions';

type SidePanelWidth = {
    width: number;
    bounds: PaneWidthBounds;
    isResizable: boolean;
};

function useSidePanelWidth(): SidePanelWidth {
    const {windowWidth} = useWindowDimensions();
    const bounds = getSidePanelWidthBounds(windowWidth);
    const {width, isResizable} = usePaneWidth(ONYXKEYS.SIDE_PANEL_WIDTH, CONST.BETAS.RESIZABLE_SIDE_PANEL, variables.sidePanelWidth, bounds);

    return {width, bounds, isResizable};
}

export default useSidePanelWidth;
