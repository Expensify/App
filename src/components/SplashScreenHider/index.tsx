import {useEffect, useEffectEvent} from 'react';
import BootSplash from '@libs/BootSplash';
import type {SplashScreenHiderProps, SplashScreenHiderReturnType} from './types';

function SplashScreenHider({shouldHideSplash, onHide}: SplashScreenHiderProps): SplashScreenHiderReturnType {
    const hide = useEffectEvent(() => {
        BootSplash.hide().then(() => onHide());
    });
    useEffect(() => {
        if (!shouldHideSplash) {
            return;
        }
        hide();
    }, [shouldHideSplash]);

    return null;
}

export default SplashScreenHider;
