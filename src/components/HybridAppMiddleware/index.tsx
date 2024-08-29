import type React from 'react';
import {useContext, useEffect, useRef, useState} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import useExitTo from '@hooks/useExitTo';
import useSplashScreen from '@hooks/useSplashScreen';
import BootSplash from '@libs/BootSplash';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as SessionUtils from '@libs/SessionUtils';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
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
function HybridAppMiddleware({children, authenticated}: HybridAppMiddlewareProps) {
    const {isSplashHidden, setIsSplashHidden} = useSplashScreen();
    const [startedTransition, setStartedTransition] = useState(false);
    const [finishedTransition, setFinishedTransition] = useState(false);

    const initialURL = useContext(InitialURLContext);
    const exitToParam = useExitTo();
    const [exitTo, setExitTo] = useState<Route | HybridAppRoute | undefined>();

    const [isAccountLoading] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.isLoading ?? false});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [completedHybridAppOnboarding] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {selector: onboardingStatusSelector});

    const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // We need to ensure that the BootSplash is always hidden after a certain period.
    useEffect(() => {
        if (!NativeModules.HybridAppModule) {
            return;
        }

        maxTimeoutRef.current = setTimeout(() => {
            Log.info('[HybridApp] Forcing transition due to unknown problem', true);
            setStartedTransition(true);
            setExitTo(ROUTES.HOME);
        }, 3000);
    }, []);
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

    // Save `exitTo` when we reach /transition route.
    // `exitTo` should always exist during OldDot -> NewDot transitions.
    useEffect(() => {
        if (!NativeModules.HybridAppModule || !exitToParam || exitTo) {
            return;
        }

        Log.info('[HybridApp] Saving `exitTo` for later', true, {exitTo: exitToParam});
        setExitTo(exitToParam);

        Log.info(`[HybridApp] Started transition`, true);
        setStartedTransition(true);
    }, [exitTo, exitToParam]);

    useEffect(() => {
        if (!startedTransition || finishedTransition) {
            return;
        }

        const transitionURL = NativeModules.HybridAppModule ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL ?? undefined, sessionEmail);

        // We need to wait with navigating to exitTo until all login-related actions are complete.
        if (!authenticated || isLoggingInAsNewUser || isAccountLoading) {
            return;
        }

        if (exitTo) {
            Navigation.isNavigationReady().then(() => {
                // We need to remove /transition from route history.
                // `useExitTo` returns undefined for routes other than /transition.
                if (exitToParam && Navigation.getActiveRoute().includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
                    Log.info('[HybridApp] Removing /transition route from history', true);
                    Navigation.goBack();
                }

                if (exitTo !== ROUTES.HOME) {
                    Log.info('[HybridApp] Navigating to `exitTo` route', true, {exitTo});
                    Navigation.navigate(Navigation.parseHybridAppUrl(exitTo));
                }
                setExitTo(undefined);

                setTimeout(() => {
                    Log.info('[HybridApp] Setting `finishedTransition` to true', true);
                    setFinishedTransition(true);
                }, CONST.SCREEN_TRANSITION_END_TIMEOUT);
            });
        }
    }, [authenticated, exitTo, exitToParam, finishedTransition, initialURL, isAccountLoading, sessionEmail, startedTransition]);

    useEffect(() => {
        if (!finishedTransition || isSplashHidden) {
            return;
        }

        Log.info('[HybridApp] Finished transition, hiding BootSplash', true);
        BootSplash.hide().then(() => {
            setIsSplashHidden(true);
            if (authenticated) {
                Log.info('[HybridApp] Handling onboarding flow', true);
                Welcome.handleHybridAppOnboarding();
            }
        });
    }, [authenticated, finishedTransition, isSplashHidden, setIsSplashHidden]);

    return children;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
