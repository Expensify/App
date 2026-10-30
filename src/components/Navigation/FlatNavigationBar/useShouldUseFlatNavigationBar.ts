import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

/**
 * Whether the wide layout draws the flat navigation bar instead of the icon bar. Web only: native tablets render the
 * same tab bar on wide, but the bar's popover anchors do not account for their safe area yet.
 */
function useShouldUseFlatNavigationBar() {
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return !shouldUseNarrowLayout && getPlatform() === CONST.PLATFORM.WEB && isBetaEnabled(CONST.BETAS.FLAT_NAV);
}

export default useShouldUseFlatNavigationBar;
