import type {NavigationHelpers, ParamListBase} from '@react-navigation/native';
import {useEffect} from 'react';
import navigationRef from '@libs/Navigation/navigationRef';

export default function useNavigationReset(navigation: NavigationHelpers<ParamListBase>, isSmallScreenWidth: boolean) {
    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        // We need to separately reset state of this navigator to trigger getRehydratedState.
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isSmallScreenWidth]);
}
