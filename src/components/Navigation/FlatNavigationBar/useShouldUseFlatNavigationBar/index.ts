import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

/** Whether the wide layout draws the flat navigation bar instead of the icon bar. */
function useShouldUseFlatNavigationBar() {
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return !shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.FLAT_NAV);
}

export default useShouldUseFlatNavigationBar;
