import type {ParamListBase} from '@react-navigation/native';
import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * This hook resets the navigation root state when changing the layout size, resetting the state calls the getRehydredState method in CustomFullScreenRouter.tsx.
 * When the screen size is changed, it is necessary to check whether the application displays the content correctly.
 * When the app is opened on a small layout and the user resizes it to wide, a second screen has to be present in the navigation state to fill the space.
 */
function useNavigationResetOnLayoutChange({navigation}: CustomEffectsHookProps<ParamListBase>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const prevShouldUseNarrowLayout = usePrevious(shouldUseNarrowLayout);

    useEffect(() => {
        if (!navigationRef.isReady() || shouldUseNarrowLayout === prevShouldUseNarrowLayout) {
            return;
        }
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout, prevShouldUseNarrowLayout]);
}

export default useNavigationResetOnLayoutChange;
