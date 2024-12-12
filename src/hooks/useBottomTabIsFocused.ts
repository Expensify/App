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
    if (topmostFullScreenName) {
        return false;
    }
    if (shouldUseNarrowLayout) {
        return isFocused || topmostCentralPane?.name === SCREENS.SEARCH.CENTRAL_PANE;
    }
    return isFocused || Object.keys(CENTRAL_PANE_SCREENS).includes(topmostCentralPane?.name ?? '');
};

export default useBottomTabIsFocused;
