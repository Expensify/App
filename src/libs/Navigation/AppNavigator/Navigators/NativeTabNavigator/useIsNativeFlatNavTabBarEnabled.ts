import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

/**
 * Whether the native tab bar shows the flat nav items: Home, Inbox, Expenses, Reports and More. Wide layouts keep their
 * JS side bar, so only a narrow layout gets them.
 */
function useIsNativeFlatNavTabBarEnabled() {
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.FLAT_NAV);
}

export default useIsNativeFlatNavTabBarEnabled;
