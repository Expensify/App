import {useContext, useEffect, useRef, useState} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import type {NativeModule} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import useExitTo from '@hooks/useExitTo';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as SessionUtils from '@libs/SessionUtils';
import CONST from '@src/CONST';
import {SplashScreenStateContext} from '@src/Expensify';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

type HybridAppSplashScreenProps = {
    authenticated: boolean;
};

/*
 * HybridAppMiddleware is responsible for handling BootSplash visibility correctly.
 * It is crucial to make transitions between OldDot and NewDot look smooth.
 * The middleware assumes that the entry point for HybridApp is the /transition route.
 */
function HybridAppSplashScreen({authenticated}: HybridAppSplashScreenProps) {
    const initialURL = useContext(InitialURLContext);
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);

    const exitToParam = useExitTo();
    const [exitTo, setExitTo] = useState<Route | HybridAppRoute | undefined>();

    const [isAccountLoading] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.isLoading ?? false});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});

    const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // We need to ensure that the BootSplash is always hidden after a certain period.
    useEffect(() => {
        if (!NativeModules.HybridAppModule) {
            return;
        }

        maxTimeoutRef.current = setTimeout(() => {
            Log.info('[HybridApp] Forcing transition due to unknown problem', true);
            setExitTo(ROUTES.HOME);
            setSplashScreenState(CONST.BOOT_SPLASH_STATE.STARTED_TRANSITION);
        }, 3000);
    }, [setSplashScreenState]);

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
            setSplashScreenState(CONST.BOOT_SPLASH_STATE.OPENED);
            setExitTo(undefined);
        });

        return () => {
            listener.remove();
        };
    }, [setSplashScreenState]);

    // Save `exitTo` when we reach /transition route.
    // `exitTo` should always exist during OldDot -> NewDot transitions.
    useEffect(() => {
        if (!NativeModules.HybridAppModule || !exitToParam || splashScreenState !== CONST.BOOT_SPLASH_STATE.OPENED) {
            return;
        }

        Log.info('[HybridApp] Saving `exitTo` for later', true, {exitTo: exitToParam});
        Log.info(`[HybridApp] Started transition`, true);
        setExitTo(exitToParam);
        setSplashScreenState(CONST.BOOT_SPLASH_STATE.STARTED_TRANSITION);
        if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
        }
    }, [exitTo, exitToParam, setSplashScreenState, splashScreenState]);

    useEffect(() => {
        if (splashScreenState !== CONST.BOOT_SPLASH_STATE.STARTED_TRANSITION) {
            return;
        }

        const transitionURL = `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}`;
        const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL, sessionEmail);

        // We need to wait with navigating to exitTo until all login-related actions are complete.
        if (!authenticated || isLoggingInAsNewUser || isAccountLoading) {
            return;
        }

        if (exitTo) {
            Navigation.isNavigationReady().then(() => {
                // We need to remove /transition from route history.
                // `useExitTo` returns undefined for routes other than /transition.
                if (exitToParam) {
                    Log.info('[HybridApp] Removing /transition route from history', true);
                    Navigation.goBack();
                }

                if (exitTo !== ROUTES.HOME) {
                    Log.info('[HybridApp] Navigating to `exitTo` route', true, {exitTo});
                    Navigation.navigate(Navigation.parseHybridAppUrl(exitTo));
                }
                setExitTo(undefined);

                setTimeout(() => {
                    setSplashScreenState(CONST.BOOT_SPLASH_STATE.FINISHED_TRANSITION);
                }, CONST.SCREEN_TRANSITION_END_TIMEOUT);
            });
        }
    }, [authenticated, exitTo, exitToParam, initialURL, isAccountLoading, sessionEmail, setSplashScreenState, splashScreenState]);

    return null;
}

HybridAppSplashScreen.displayName = 'HybridAppSplashScreen';

export default HybridAppSplashScreen;
