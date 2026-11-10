/** Whether the RHP's focused card is single-width, so the user can drag it to resize, alone or stacked on a wide or super-wide card. */
import {useWideRHPState} from '@components/WideRHPContextProvider';

import CONST from '@src/CONST';

import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

/** Only on a wide layout, and never while a wide or super-wide card is the focused one. */
function useIsResizableSingleRHP(): boolean {
    const {isBetaEnabled} = usePermissions();
    const {isWideRHPFocused, isSuperWideRHPFocused} = useWideRHPState();

    // The window's width, because inside the RHP shouldUseNarrowLayout is always true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return isBetaEnabled(CONST.BETAS.RESIZABLE_RHP) && !isSmallScreenWidth && !isWideRHPFocused && !isSuperWideRHPFocused;
}

export default useIsResizableSingleRHP;
