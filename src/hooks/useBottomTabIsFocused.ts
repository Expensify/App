import {useIsFocused, useNavigationState} from '@react-navigation/native';
import CENTRAL_PANE_SCREENS from '@libs/Navigation/AppNavigator/CENTRAL_PANE_SCREENS';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import getTopmostFullScreenRoute from '@libs/Navigation/getTopmostFullScreenRoute';
import type {CentralPaneName, FullScreenName, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import useResponsiveLayout from './useResponsiveLayout';

const useBottomTabIsFocused = () => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const topmostFullScreenName = useNavigationState<RootStackParamList, NavigationPartialRoute<FullScreenName> | undefined>(getTopmostFullScreenRoute);
    const topmostCentralPane = useNavigationState<RootStackParamList, NavigationPartialRoute<CentralPaneName> | undefined>(getTopmostCentralPaneRoute);
    // if there is a full screen like worspace settings, not found screen, etc. then bottom tab should is not focused
    if (topmostFullScreenName) {
        return false;
    }
    // on search screen, isFocused is returned false but it is focused
    if (shouldUseNarrowLayout) {
        return isFocused || topmostCentralPane?.name === SCREENS.SEARCH.CENTRAL_PANE;
    }
    // on desktop screen size isFocused is always returned as false so we can't rely on it to determine if bottom tab is focused
    return isFocused || Object.keys(CENTRAL_PANE_SCREENS).includes(topmostCentralPane?.name ?? '');
};

export default useBottomTabIsFocused;
