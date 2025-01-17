import type {EventArg, NavigationContainerEventMap} from '@react-navigation/native';
import {useIsFocused, useNavigationState} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import CENTRAL_PANE_SCREENS from '@libs/Navigation/AppNavigator/CENTRAL_PANE_SCREENS';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import getTopmostFullScreenRoute from '@libs/Navigation/getTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {CentralPaneName, FullScreenName, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import useResponsiveLayout from './useResponsiveLayout';

const useBottomTabIsFocused = () => {
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    useEffect(() => {
        const listener = (event: EventArg<'state', false, NavigationContainerEventMap['state']['data']>) => {
            const routName = Navigation.getRouteNameFromStateEvent(event);
            if (routName === SCREENS.SEARCH.CENTRAL_PANE || routName === SCREENS.SETTINGS_CENTRAL_PANE || routName === SCREENS.HOME) {
                setIsScreenFocused(true);
                return;
            }
            setIsScreenFocused(false);
        };
        navigationRef.addListener('state', listener);
        return () => navigationRef.removeListener('state', listener);
    }, []);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const topmostFullScreenName = useNavigationState<RootStackParamList, NavigationPartialRoute<FullScreenName> | undefined>(getTopmostFullScreenRoute);
    const topmostCentralPane = useNavigationState<RootStackParamList, NavigationPartialRoute<CentralPaneName> | undefined>(getTopmostCentralPaneRoute);

    // If there is a full screen view such as Workspace Settings or Not Found screen, the bottom tab should not be considered focused
    if (topmostFullScreenName) {
        return false;
    }
    // On the Search screen, isFocused returns false, but it is actually focused
    if (shouldUseNarrowLayout) {
        return isFocused || isScreenFocused;
    }
    // On desktop screen sizes, isFocused always returns false, so we cannot rely on it alone to determine if the bottom tab is focused
    return isFocused || Object.keys(CENTRAL_PANE_SCREENS).includes(topmostCentralPane?.name ?? '');
};

export default useBottomTabIsFocused;
