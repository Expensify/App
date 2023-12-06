import {useEffect} from 'react';
import BootSplash from '@libs/BootSplash';
import AnimatedSplashScreenProps from './types';

function AnimatedSplashScreen({onHide = () => {}}: AnimatedSplashScreenProps) {
    useEffect(() => {
        BootSplash.hide().then(() => onHide());
    }, [onHide]);

    return null;
}

AnimatedSplashScreen.displayName = 'AnimatedSplashScreen';

export default AnimatedSplashScreen;
