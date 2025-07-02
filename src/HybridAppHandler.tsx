import {useContext, useState} from 'react';
import HybridAppModule from "@expensify/react-native-hybrid-app/src/index.native";
import Log from './libs/Log';
import CONFIG from './CONFIG';
import CONST from './CONST';
import {signInAfterTransitionFromOldDot} from './libs/actions/Session';
import SplashScreenStateContext from './SplashScreenStateContext';

function HybridAppHandler() {
    const [signInHandled, setSignInHandled] = useState(false);
    const {setSplashScreenState} = useContext(SplashScreenStateContext);

    if (!CONFIG.IS_HYBRID_APP || signInHandled) {
        return null;
    }

    HybridAppModule.getHybridAppSettings().then((hybridAppSettings: string | null) => {
        if(!hybridAppSettings) {
            // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
            Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
            return;
        }

        signInAfterTransitionFromOldDot(hybridAppSettings).then(() => {
            setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            setSignInHandled(true);
        });
    });

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;
