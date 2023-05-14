import {useEffect} from 'react';
import BootSplash from '../../libs/BootSplash';

const SplashScreenHider = () => {
    useEffect(() => {
        BootSplash.hide();
    }, []);

    return null;
};

SplashScreenHider.displayName = 'SplashScreenHider';
export default SplashScreenHider;
