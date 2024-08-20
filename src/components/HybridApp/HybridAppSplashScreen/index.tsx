import {useContext, useEffect, useRef, useState} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import useExitTo from '@hooks/useExitTo';
import useSplashScreen from '@hooks/useSplashScreen';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as SessionUtils from '@libs/SessionUtils';
import CONST from '@src/CONST';
import {ShouldHideHybridAppSplashScreenContext} from '@src/Expensify';
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
    const {isSplashHidden} = useSplashScreen();
    const initialURL = useContext(InitialURLContext);
    const {shouldHideHybridAppSplashScreen, setShouldHideHybridAppSplashScreen} = useContext(ShouldHideHybridAppSplashScreenContext);

    const exitToParam = useExitTo();
    const [exitTo, setExitTo] = useState<Route | HybridAppRoute | undefined>();
    const [finishedTransition, setFinishedTransition] = useState(false);

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
        }, 3000);
    }, []);

    // Save `exitTo` when we reach /transition route.
    // `exitTo` should always exist during OldDot -> NewDot transitions.
    useEffect(() => {
        if (!NativeModules.HybridAppModule || !exitToParam || exitTo) {
            return;
        }

        Log.info('[HybridApp] Saving `exitTo` for later', true, {exitTo: exitToParam});
        Log.info(`[HybridApp] Started transition`, true);
        setExitTo(exitToParam);
    }, [exitTo, exitToParam]);

    useEffect(() => {
        // once exitTo is set we can continue
        if (!exitTo) {
            return;
        }

        const transitionURL = `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}`;
        const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL, sessionEmail);

        // We need to wait with navigating to exitTo until all login-related actions are complete.
        if (!authenticated || isLoggingInAsNewUser || isAccountLoading) {
            return;
        }

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
    }, [authenticated, exitTo, exitToParam, initialURL, isAccountLoading, sessionEmail]);

    useEffect(() => {
        if (!finishedTransition || shouldHideHybridAppSplashScreen || isSplashHidden) {
            return;
        }
        setShouldHideHybridAppSplashScreen(true);
    }, [finishedTransition, isSplashHidden, setShouldHideHybridAppSplashScreen, shouldHideHybridAppSplashScreen]);

    return null;
}

HybridAppSplashScreen.displayName = 'HybridAppSplashScreen';

export default HybridAppSplashScreen;
