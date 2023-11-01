import {useEffect} from 'react';
import BootSplash from '@libs/BootSplash';
import type SplashScreenHiderProps from './types';

function SplashScreenHider({onHide = () => {}}: SplashScreenHiderProps) {
    useEffect(() => {
        BootSplash.hide().then(() => onHide());
    }, [onHide]);

    return null;
}

SplashScreenHider.displayName = 'SplashScreenHider';

export default SplashScreenHider;
