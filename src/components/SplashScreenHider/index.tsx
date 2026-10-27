import BootSplash from '@libs/BootSplash';

import {useEffect} from 'react';

import type {SplashScreenHiderProps, SplashScreenHiderReturnType} from './types';

function SplashScreenHider({onHide, shouldHideSplash}: SplashScreenHiderProps): SplashScreenHiderReturnType {
    const hide = () => {
        BootSplash.hide().then(() => onHide());
    };

    useEffect(() => {
        if (!shouldHideSplash) {
            return;
        }
        hide();
    }, [shouldHideSplash, hide]);

    return null;
}

export default SplashScreenHider;
