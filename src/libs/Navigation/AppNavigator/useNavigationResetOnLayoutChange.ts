import type {ParamListBase} from '@react-navigation/native';
import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

function useNavigationResetOnLayoutChange({navigation}: CustomEffectsHookProps<ParamListBase>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout]);
}

export default useNavigationResetOnLayoutChange;
