import {useEffect} from 'react';
import BootSplash from '@libs/BootSplash';
import type {SplashScreenHiderProps, SplashScreenHiderReturnType} from './types';

function SplashScreenHider({onHide = () => {}}: SplashScreenHiderProps): SplashScreenHiderReturnType {
    useEffect(() => {
        BootSplash.hide().then(() => onHide());
    }, [onHide]);

    return null;
}

export default SplashScreenHider;
