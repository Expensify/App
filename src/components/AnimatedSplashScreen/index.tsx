import {useEffect} from 'react';
import {setLastShownSplashScreenVideo} from '@libs/actions/Session';
import BootSplash from '@libs/BootSplash';
import type AnimatedSplashScreenProps from './types';

function AnimatedSplashScreen({onHide = () => {}}: AnimatedSplashScreenProps) {
    useEffect(() => {
        BootSplash.hide().then(() => onHide());
        setLastShownSplashScreenVideo(localStorage.getItem('lastShownSplashVideo') ?? '');
    }, [onHide]);

    return null;
}

AnimatedSplashScreen.displayName = 'AnimatedSplashScreen';

export default AnimatedSplashScreen;
