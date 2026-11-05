/** The side panel's committed width on a wide layout, clamped to the bounds the window allows. */
import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';
import type {SidePanelWidthBounds} from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import usePaneWidth from './usePaneWidth';
import useWindowDimensions from './useWindowDimensions';

type SidePanelWidth = SidePanelWidthBounds & {
    width: number;
};

function useSidePanelWidth(): SidePanelWidth {
    const {windowWidth} = useWindowDimensions();
    const bounds = getSidePanelWidthBounds(windowWidth);
    const width = usePaneWidth(ONYXKEYS.SIDE_PANEL_WIDTH, CONST.BETAS.RESIZABLE_SIDE_PANEL, variables.sidePanelWidth, bounds);

    return {...bounds, width};
}

export default useSidePanelWidth;
