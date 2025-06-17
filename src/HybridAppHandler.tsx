import {useContext, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {AppProps} from './App';
import CONFIG from './CONFIG';
import CONST from './CONST';
import {parseHybridAppSettings} from './libs/actions/HybridApp';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import ONYXKEYS from './ONYXKEYS';
import SplashScreenStateContext from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler({hybridAppSettings}: AppProps) {
    const [signInHandled, setSignInHandled] = useState(false);
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});

    const isLoading = isLoadingOnyxValue(tryNewDotMetadata);

    if (!CONFIG.IS_HYBRID_APP || !hybridAppSettings || signInHandled || isLoading) {
        return null;
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

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;
