import {useIsFocused} from '@react-navigation/native';
import type {EventArg, NavigationContainerEventMap} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import SCREENS from '@src/SCREENS';
import type UseScrollEnabled from './types';

const useScrollEnabled: UseScrollEnabled = (RNScrollEnabled?: boolean) => {
    const isFocused = useIsFocused();
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

    // On the Search, Settings, Home screen, isFocused returns false, but it is actually focused
    if (shouldUseNarrowLayout) {
        return isFocused || isScreenFocused;
    }

    //  On desktop screen sizes, isFocused always returns false when useIsFocused is called inside the bottom tab. So, we need to manually set scrollEnabled for ScrollView in this case
    return isFocused || RNScrollEnabled;
};
export default useScrollEnabled;
