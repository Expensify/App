import {useCallback, useEffect} from 'react';
import BootSplash from '@libs/BootSplash';
import type {SplashScreenHiderProps, SplashScreenHiderReturnType} from './types';

function SplashScreenHider({onHide, shouldHideSplash}: SplashScreenHiderProps): SplashScreenHiderReturnType {
    const hide = useCallback(() => {
        BootSplash.hide().then(() => onHide());
    }, [onHide]);

    useEffect(() => {
        if (!shouldHideSplash) {
            return;
        }
        hide();
    }, [shouldHideSplash, hide]);

    return null;
}

export default SplashScreenHider;
