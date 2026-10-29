/** Whether the RHP is a lone single-width card that the user can drag to resize. */
import {useWideRHPState} from '@components/WideRHPContextProvider';

import CONST from '@src/CONST';

import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

/** Only on a wide layout, and only while no wide or super-wide RHP is open, since the single card then stacks on one. */
function useIsResizableSingleRHP(): boolean {
    const {isBetaEnabled} = usePermissions();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    // The window's width, because inside the RHP shouldUseNarrowLayout is always true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return isBetaEnabled(CONST.BETAS.RESIZABLE_RHP) && !isSmallScreenWidth && wideRHPRouteKeys.length === 0 && superWideRHPRouteKeys.length === 0;
}

export default useIsResizableSingleRHP;
