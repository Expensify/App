import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useContext, useEffect} from 'react';
import CONFIG from './CONFIG';
import CONST from './CONST';
import useNetwork from './hooks/useNetwork';
import {parseHybridAppSettings} from './libs/actions/HybridApp';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Log from './libs/Log';
import ONYXKEYS from './ONYXKEYS';
import SplashScreenStateContext from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const network = useNetwork();

    const isLoading = isLoadingOnyxValue(tryNewDotMetadata);

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || isLoading) {
            return;
        }

        HybridAppModule.getHybridAppSettings().then((hybridAppSettings: string | null) => {
            if (!hybridAppSettings) {
                // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
                Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
                return;
            }

            setupNewDotAfterTransitionFromOldDot(parseHybridAppSettings(hybridAppSettings), tryNewDot, network.isOffline, network.shouldForceOffline).then(() => {
                if (splashScreenState !== CONST.BOOT_SPLASH_STATE.VISIBLE) {
                    return;
                }
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            });
        });
    }, [isLoading, network.isOffline, network.shouldForceOffline, setSplashScreenState, splashScreenState, tryNewDot]);

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;
