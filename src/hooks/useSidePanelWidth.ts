/** The Side Panel's committed width on a wide layout, clamped to the bounds the window allows. */
import {ALL_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';

import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';
import type {SidePanelWidthBounds} from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';

import lodashClamp from 'lodash/clamp';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useRootNavigationState from './useRootNavigationState';
import useWindowDimensions from './useWindowDimensions';

type SidePanelWidth = SidePanelWidthBounds & {
    width: number;
};

/** Clamped at render rather than when saved, so a window that shrinks and grows back returns to the dragged width. */
function useSidePanelWidth(): SidePanelWidth {
    const [storedWidth] = useOnyx(ONYXKEYS.SIDE_PANEL_WIDTH);
    const {isBetaEnabled} = usePermissions();
    const {windowWidth} = useWindowDimensions();
    // Read from navigation state, since the Side Panel's provider sits above the wide RHP context.
    const isWideRHPOpen = useRootNavigationState((state) => {
        const lastRoute = state?.routes?.at(-1);
        return lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && !!lastRoute.state?.routes?.some((route) => ALL_WIDE_RIGHT_MODALS.has(route.name));
    });
    const {min, max} = getSidePanelWidthBounds(windowWidth, isWideRHPOpen);

    // The beta can turn off without a chance to clear the saved width, and there is no handle to drag it back then.
    if (!isBetaEnabled(CONST.BETAS.RESIZABLE_RHP)) {
        return {width: variables.sidePanelWidth, min, max};
    }

    return {width: lodashClamp(storedWidth ?? variables.sidePanelWidth, min, max), min, max};
}

export default useSidePanelWidth;
