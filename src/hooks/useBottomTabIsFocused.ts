import {useIsFocused, useNavigationState} from '@react-navigation/native';
import {useOnyx} from 'react-native-onyx';
import CENTRAL_PANE_SCREENS from '@libs/Navigation/AppNavigator/CENTRAL_PANE_SCREENS';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import getTopmostFullScreenRoute from '@libs/Navigation/getTopmostFullScreenRoute';
import type {CentralPaneName, FullScreenName, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import useResponsiveLayout from './useResponsiveLayout';

const useBottomTabIsFocused = () => {
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isModalVisible = modal?.isVisible || modal?.willAlertModalBecomeVisible;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const topmostFullScreenName = useNavigationState<RootStackParamList, NavigationPartialRoute<FullScreenName> | undefined>(getTopmostFullScreenRoute);
    const topmostCentralPane = useNavigationState<RootStackParamList, NavigationPartialRoute<CentralPaneName> | undefined>(getTopmostCentralPaneRoute);
    if (isModalVisible) {
        return false;
    }
    // If there is a full screen view such as Workspace Settings or Not Found screen, the bottom tab should not be considered focused
    if (topmostFullScreenName) {
        return false;
    }
    // On the Search screen, isFocused returns false, but it is actually focused
    if (shouldUseNarrowLayout) {
        return isFocused || topmostCentralPane?.name === SCREENS.SEARCH.CENTRAL_PANE;
    }
    // On desktop screen sizes, isFocused always returns false, so we cannot rely on it alone to determine if the bottom tab is focused
    return isFocused || Object.keys(CENTRAL_PANE_SCREENS).includes(topmostCentralPane?.name ?? '');
};

export default useBottomTabIsFocused;
