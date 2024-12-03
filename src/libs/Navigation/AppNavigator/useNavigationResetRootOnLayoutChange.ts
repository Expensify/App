import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';

function useNavigationResetRootOnLayoutChange() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigationRef.resetRoot(navigationRef.getRootState());
    }, [shouldUseNarrowLayout]);
}

export default useNavigationResetRootOnLayoutChange;
