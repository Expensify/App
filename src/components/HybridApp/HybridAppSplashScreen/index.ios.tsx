import {useContext, useEffect, useRef, useState} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import type {NativeModule} from 'react-native';
import {useOnyx} from 'react-native-onyx';
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

type HybridAppSplashScreenProps = {
    authenticated: boolean;
};

/*
 * HybridAppMiddleware is responsible for handling BootSplash visibility correctly.
 * It is crucial to make transitions between OldDot and NewDot look smooth.
 * The middleware assumes that the entry point for HybridApp is the /transition route.
 */
function HybridAppSplashScreen({authenticated}: HybridAppSplashScreenProps) {
    const {isSplashHidden, setIsSplashHidden} = useSplashScreen();
    const [startedTransition, setStartedTransition] = useState(false);
    const [finishedTransition, setFinishedTransition] = useState(false);

    const initialURL = useContext(InitialURLContext);
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
            setStartedTransition(true);
            setExitTo(ROUTES.HOME);
        }, 3000);
    }, []);

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
            setIsSplashHidden(false);
            setStartedTransition(false);
            setFinishedTransition(false);
            setExitTo(undefined);
        });

        return () => {
            listener.remove();
        };
    }, [setIsSplashHidden]);

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
                if (exitToParam) {
                    Log.info('[HybridApp] Removing /transition route from history', true);
                    Navigation.goBack();
                }

                Log.info('[HybridApp] Navigating to `exitTo` route', true, {exitTo});
                Navigation.navigate(Navigation.parseHybridAppUrl(exitTo));
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

    return null;
}

HybridAppSplashScreen.displayName = 'HybridAppSplashScreen';

export default HybridAppSplashScreen;
