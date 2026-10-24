/** The single RHP's committed width, clamped to the bounds the window allows. */
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';
import type {SingleRHPWidthBounds} from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import lodashClamp from 'lodash/clamp';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';
import useSidePanelState from './useSidePanelState';
import useWindowDimensions from './useWindowDimensions';

type SingleRHPWidth = SingleRHPWidthBounds & {
    width: number;
};

/** Clamped at render rather than when saved, so a window that shrinks and grows back returns to the dragged width. */
function useSingleRHPWidth(): SingleRHPWidth {
    const [storedWidth] = useOnyx(ONYXKEYS.SINGLE_RHP_WIDTH);
    const {isBetaEnabled} = usePermissions();
    const {windowWidth} = useWindowDimensions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {shouldHideSidePanel} = useSidePanelState();

    // Mirrors when SidePanelContextProvider shifts the RHP left by the panel's width.
    const {min, max} = getSingleRHPWidthBounds(windowWidth, isExtraLargeScreenWidth && !shouldHideSidePanel ? variables.sidePanelWidth : 0);

    // The beta can turn off without a chance to clear the saved width, and there is no handle to drag it back then.
    if (!isBetaEnabled(CONST.BETAS.RESIZABLE_RHP)) {
        return {width: variables.rhpWidth, min, max};
    }

    return {width: lodashClamp(storedWidth ?? variables.rhpWidth, min, max), min, max};
}

export default useSingleRHPWidth;
