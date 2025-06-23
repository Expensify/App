import {useContext, useState} from 'react';
import type {AppProps} from './App';
import CONFIG from './CONFIG';
import CONST from './CONST';
import {signInAfterTransitionFromOldDot} from './libs/actions/Session';
import SplashScreenStateContext from './SplashScreenStateContext';

function HybridAppHandler({hybridAppSettings}: AppProps) {
    const [signInHandled, setSignInHandled] = useState(false);
    const {setSplashScreenState} = useContext(SplashScreenStateContext);

    if (!CONFIG.IS_HYBRID_APP || !hybridAppSettings || signInHandled) {
        return null;
    }

    signInAfterTransitionFromOldDot(hybridAppSettings).then(() => {
        setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
        setSignInHandled(true);
    });

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;
