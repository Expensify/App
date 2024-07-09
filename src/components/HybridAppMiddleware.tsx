import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {NativeModules} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useSplashScreen from '@hooks/useSplashScreen';
import BootSplash from '@libs/BootSplash';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {RootStackParamList} from '@libs/Navigation/types';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {TryNewDot} from '@src/types/onyx';

type HybridAppMiddlewareProps = {
    children: React.ReactNode;
};

type HybridAppMiddlewareContextType = {
    navigateToExitUrl: (exitUrl: Route) => void;
    showSplashScreenOnNextStart: () => void;
};
const HybridAppMiddlewareContext = React.createContext<HybridAppMiddlewareContextType>({
    navigateToExitUrl: () => {},
    showSplashScreenOnNextStart: () => {},
});

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
 */
function HybridAppMiddleware(props: HybridAppMiddlewareProps) {
    const {isSplashHidden, setIsSplashHidden} = useSplashScreen();
    const [startedTransition, setStartedTransition] = useState(false);
    const [finishedTransition, setFinishedTransition] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [completedHybridAppOnboarding] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {selector: onboardingStatusSelector});

    /**
     * This useEffect tracks changes of `nvp_tryNewDot` value.
     * We propagate it from OldDot to NewDot with native method due to limitations of old app.
     */
    useEffect(() => {
        if (completedHybridAppOnboarding === undefined) {
            return;
        }

        Log.info(`[HybridApp] Onboarding status has changed. Propagating new value to OldDot`, true, {completedHybridAppOnboarding});
        NativeModules.HybridAppModule.completeOnboarding(completedHybridAppOnboarding);
    }, [completedHybridAppOnboarding]);

    /*
     * Handles navigation during transition from OldDot. For ordinary NewDot app it is just pure navigation.
     */
    const navigateToExitUrl = useCallback((exitUrl: Route) => {
        if (NativeModules.HybridAppModule) {
            setStartedTransition(true);
            Log.info(`[HybridApp] Started transition to ${exitUrl}`, true);
        }

        Navigation.navigate(exitUrl);
    }, []);

    /**
     * This function only affects iOS. If during a single app lifecycle we frequently transition from OldDot to NewDot,
     * we need to artificially show the bootsplash because the app is only booted once.
     */
    const showSplashScreenOnNextStart = useCallback(() => {
        setIsSplashHidden(false);
        setStartedTransition(false);
        setFinishedTransition(false);
    }, [setIsSplashHidden]);

    useEffect(() => {
        if (!finishedTransition || isSplashHidden) {
            return;
        }

        Log.info('[HybridApp] Finished transtion', true);
        BootSplash.hide().then(() => {
            setIsSplashHidden(true);
            Log.info('[HybridApp] Handling onboarding flow', true);
            Welcome.handleHybridAppOnboarding();
        });
    }, [finishedTransition, isSplashHidden, setIsSplashHidden]);

    useEffect(() => {
        if (!startedTransition) {
            return;
        }

        // On iOS, the transitionEnd event doesn't trigger some times. As such, we need to set a timeout.
        const timeout = setTimeout(() => {
            setFinishedTransition(true);
        }, CONST.SCREEN_TRANSITION_END_TIMEOUT);

        const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', () => {
            clearTimeout(timeout);
            setFinishedTransition(true);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribeTransitionEnd();
        };
    }, [navigation, startedTransition]);

    const contextValue = useMemo(
        () => ({
            navigateToExitUrl,
            showSplashScreenOnNextStart,
        }),
        [navigateToExitUrl, showSplashScreenOnNextStart],
    );

    return <HybridAppMiddlewareContext.Provider value={contextValue}>{props.children}</HybridAppMiddlewareContext.Provider>;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
export type {HybridAppMiddlewareContextType};
export {HybridAppMiddlewareContext};
