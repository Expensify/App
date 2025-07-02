import {useContext, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import HybridAppModule from "@expensify/react-native-hybrid-app/src/index.native";
import Log from './libs/Log';
import CONFIG from './CONFIG';
import CONST from './CONST';
import {parseHybridAppSettings} from './libs/actions/HybridApp';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import ONYXKEYS from './ONYXKEYS';
import SplashScreenStateContext from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const [signInHandled, setSignInHandled] = useState(false);
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});

    const isLoading = isLoadingOnyxValue(tryNewDotMetadata);

    if (!CONFIG.IS_HYBRID_APP || signInHandled || isLoading) {
        return null;
    }

    HybridAppModule.getHybridAppSettings().then((hybridAppSettings: string | null) => {
        if(!hybridAppSettings) {
            // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
            Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
            return;
        }

        const parsedHybridAppSettings = parseHybridAppSettings(hybridAppSettings);

        setupNewDotAfterTransitionFromOldDot(parsedHybridAppSettings, tryNewDot).then(() => {
            if (parsedHybridAppSettings.hybridApp?.loggedOutFromOldDot) {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
            } else if (splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE) {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            }
            setSignInHandled(true);
        });
    });

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;
