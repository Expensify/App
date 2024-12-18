import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';

/**
 * This hook resets the navigation root state when changing the layout size, resetting the state calls the getRehydredState method in CustomRouter.ts.
 * When the screen size is changed, it is necessary to check whether the application displays the content correctly.
 * When the app is opened on a small layout and the user resizes it to wide, a second screen has to be present in the navigation state to fill the space.
 */
function useNavigationResetRootOnLayoutChange() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const prevShouldUseNarrowLayout = usePrevious(shouldUseNarrowLayout);

    useEffect(() => {
        if (!navigationRef.isReady() || shouldUseNarrowLayout === prevShouldUseNarrowLayout) {
            return;
        }
        navigationRef.resetRoot(navigationRef.getRootState());
    }, [prevShouldUseNarrowLayout, shouldUseNarrowLayout]);
}

export default useNavigationResetRootOnLayoutChange;
