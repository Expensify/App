import type React from 'react';
import {useEffect} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import type {NativeModule} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';
import type {TryNewDot} from '@src/types/onyx';

type HybridAppMiddlewareProps = {
    authenticated: boolean;
    children: React.ReactNode;
};

const onboardingStatusSelector = (tryNewDot: OnyxEntry<TryNewDot>) => {
    let completedHybridAppOnboarding = tryNewDot?.classicRedirect?.completedHybridAppOnboarding;

    if (typeof completedHybridAppOnboarding === 'string') {
        completedHybridAppOnboarding = completedHybridAppOnboarding === 'true';
    }

    return completedHybridAppOnboarding;
};

/*
 * HybridAppMiddleware is responsible for handling BootSplash visibility correctly.
 * It is crucial to make transitions between OldDot and NewDot look smooth.
 * The middleware assumes that the entry point for HybridApp is the /transition route.
 */
function HybridAppMiddleware({children}: HybridAppMiddlewareProps) {
    const {setSplashScreenState} = useSplashScreenStateContext();
    const [completedHybridAppOnboarding] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {selector: onboardingStatusSelector});

    /**
     * This useEffect tracks changes of `nvp_tryNewDot` value.
     * We propagate it from OldDot to NewDot with native method due to limitations of old app.
     */
    useEffect(() => {
        if (completedHybridAppOnboarding === undefined) {
            return;
        }

        if (!NativeModules.HybridAppModule) {
            Log.hmmm(`[HybridApp] Onboarding status has changed, but the HybridAppModule is not defined`);
            return;
        }

        Log.info(`[HybridApp] Onboarding status has changed. Propagating new value to OldDot`, true, {completedHybridAppOnboarding});
        NativeModules.HybridAppModule.completeOnboarding(completedHybridAppOnboarding);
    }, [completedHybridAppOnboarding]);

    // In iOS, the HybridApp defines the `onReturnToOldDot` event.
    // If we frequently transition from OldDot to NewDot during a single app lifecycle,
    // we need to artificially display the bootsplash since the app is booted only once.
    // Therefore, isSplashHidden needs to be updated at the appropriate time.
    useEffect(() => {
        if (!NativeModules.HybridAppModule) {
            return;
        }
        const HybridAppEvents = new NativeEventEmitter(NativeModules.HybridAppModule as unknown as NativeModule);
        const listener = HybridAppEvents.addListener(CONST.EVENTS.ON_RETURN_TO_OLD_DOT, () => {
            Log.info('[HybridApp] `onReturnToOldDot` event received. Resetting state of HybridAppMiddleware', true);
            setSplashScreenState(CONST.BOOT_SPLASH_STATE.VISIBLE);
        });

        return () => {
            listener.remove();
        };
    }, [setSplashScreenState]);

    return children;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
