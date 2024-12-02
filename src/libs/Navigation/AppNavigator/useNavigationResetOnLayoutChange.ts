import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';

function useNavigationResetOnLayoutChange() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.resetRoot(navigationRef.getRootState());
    }, [shouldUseNarrowLayout]);
}

export default useNavigationResetOnLayoutChange;
