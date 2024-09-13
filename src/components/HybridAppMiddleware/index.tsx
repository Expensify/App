import type React from 'react';
import {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';

type HybridAppMiddlewareProps = {
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
    const [completedHybridAppOnboarding] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {selector: onboardingStatusSelector});

    /**
     * This useEffect tracks changes of `nvp_tryNewDot` value.
     * We propagate it from OldDot to NewDot with native method due to limitations of old app.
     */
    useEffect(() => {
        if (completedHybridAppOnboarding === undefined || !NativeModules.HybridAppModule) {
            return;
        }

        Log.info(`[HybridApp] Onboarding status has changed. Propagating new value to OldDot`, true, {completedHybridAppOnboarding});
        NativeModules.HybridAppModule.completeOnboarding(completedHybridAppOnboarding);
    }, [completedHybridAppOnboarding]);

    return children;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
