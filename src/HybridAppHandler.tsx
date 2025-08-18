import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useCallback, useContext, useEffect, useState} from 'react';
import CONFIG from './CONFIG';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import {getHybridAppSettings} from './libs/actions/HybridApp';
import type HybridAppSettings from './libs/actions/HybridApp/types';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Log from './libs/Log';
import ONYXKEYS from './ONYXKEYS';
import SplashScreenStateContext from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

function HybridAppHandler() {
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const [shouldClearOldDot, setShouldClearOldDot] = useState<boolean>();

    const isLoading = isLoadingOnyxValue(tryNewDotMetadata);

    const finalizeTransitionFromOldDot = useCallback(
        (hybridAppSettings: HybridAppSettings) => {
            const loggedOutFromOldDot = !!hybridAppSettings.hybridApp.loggedOutFromOldDot;

            setShouldClearOldDot(loggedOutFromOldDot);
            setupNewDotAfterTransitionFromOldDot(hybridAppSettings, tryNewDot).then(() => {
                if (splashScreenState !== CONST.BOOT_SPLASH_STATE.VISIBLE) {
                    return;
                }

                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            });
        },
        [setSplashScreenState, splashScreenState, tryNewDot],
    );

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || !shouldClearOldDot || splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN) {
            return;
        }
        HybridAppModule.clearOldDotAfterSignOut();
    }, [shouldClearOldDot, splashScreenState]);

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || isLoading) {
            return;
        }

        getHybridAppSettings().then((hybridAppSettings: HybridAppSettings | null) => {
            if (!hybridAppSettings) {
                // Native method can send non-null value only once per NewDot lifecycle. It prevents issues with multiple initializations during reloads on debug builds.
                Log.info('[HybridApp] `getHybridAppSettings` called more than once during single NewDot lifecycle. Skipping initialization.');
                return;
            }
            finalizeTransitionFromOldDot(hybridAppSettings);
        });
    }, [finalizeTransitionFromOldDot, isLoading, setSplashScreenState, splashScreenState, tryNewDot]);

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;
