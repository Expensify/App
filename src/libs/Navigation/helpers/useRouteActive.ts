import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

function useIsAccountSettingsRouteActive(isNarrowLayout: boolean) {
    const focusedRoute = useNavigationState(findFocusedRoute);
    const navigationState = useRootNavigationState((x) => x);

    const isSettingsSplitNavigator = navigationState?.routes.at(-1)?.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;
    const isAccountSettings = focusedRoute?.name === SCREENS.SETTINGS.ROOT;

    return isNarrowLayout ? isAccountSettings && isSettingsSplitNavigator : isSettingsSplitNavigator;
}

export default useIsAccountSettingsRouteActive;
