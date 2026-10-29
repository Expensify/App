import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getTabWithoutBarItem from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/getTabWithoutBarItem';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * When the native tab bar has no Account item, the Account tab is drawn inside another tab and has no history of its
 * own, so the Android back button needs its own way back.
 */
function useIsSettingsDrawnOverTabs() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    return shouldUseNarrowLayout && getTabWithoutBarItem(isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE)) === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;
}

export default useIsSettingsDrawnOverTabs;
