import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

/**
 * With the Insights beta the native tab bar has no Account item, so the Account tab is drawn over the other tabs
 * as a full screen with the bar hidden, and it needs its own way back.
 */
function useIsSettingsDrawnOverTabs() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    return shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
}

export default useIsSettingsDrawnOverTabs;
