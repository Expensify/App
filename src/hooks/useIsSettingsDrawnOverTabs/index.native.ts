import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getTabWithoutBarItem from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/getTabWithoutBarItem';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * When the native tab bar has no Account item, the Account tab is drawn over the other tabs
 * as a full screen with the bar hidden, and it needs its own way back.
 */
function useIsSettingsDrawnOverTabs() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    return shouldUseNarrowLayout && getTabWithoutBarItem(isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE)) === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;
}

export default useIsSettingsDrawnOverTabs;
