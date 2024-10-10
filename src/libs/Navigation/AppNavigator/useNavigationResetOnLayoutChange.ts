import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

function useNavigationResetOnLayoutChange({navigation}: CustomEffectsHookProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        // We need to separately reset state of this navigator to trigger getRehydratedState.
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout]);
}

export default useNavigationResetOnLayoutChange;
