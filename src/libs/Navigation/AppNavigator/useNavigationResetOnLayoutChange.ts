import type {ParamListBase} from '@react-navigation/native';
import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * This hook resets the navigation root state when changing the layout size, resetting the state calls the getRehydratedState method in CustomFullScreenRouter.tsx.
 * It is also called when the navigator is created to set the initial state correctly.
 * When the screen size is changed, it is necessary to check whether the application displays the content correctly.
 * When the app is opened on a small layout and the user resizes it to wide, a second screen has to be present in the navigation state to fill the space.
 */
function useNavigationResetOnLayoutChange({navigation}: CustomEffectsHookProps<ParamListBase>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout]);
}

export default useNavigationResetOnLayoutChange;
