import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useSplashScreen from '@hooks/useSplashScreen';
import useTransitionRouteParams from '@hooks/useTransitionRouteParams';
import BootSplash from '@libs/BootSplash';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as SessionUtils from '@libs/SessionUtils';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import {InitialURLContext} from './InitialURLContextProvider';

type HybridAppMiddlewareProps = {
    authenticated: boolean;
    children: React.ReactNode;
};

type HybridAppMiddlewareContextType = {
    showSplashScreenOnNextStart: () => void;
};
const HybridAppMiddlewareContext = React.createContext<HybridAppMiddlewareContextType>({
    showSplashScreenOnNextStart: () => {},
});

/*
 * HybridAppMiddleware is responsible for handling BootSplash visibility correctly.
 * It is crucial to make transitions between OldDot and NewDot look smooth.
 * The middleware assumes that the entry point for HybridApp is the /transition route.
 */
function HybridAppMiddleware({children, authenticated}: HybridAppMiddlewareProps) {
    const {isSplashHidden, setIsSplashHidden} = useSplashScreen();
    const [startedTransition, setStartedTransition] = useState(false);
    const [finishedTransition, setFinishedTransition] = useState(false);
    const [forcedTransition, setForcedTransition] = useState(false);

    const initialURL = useContext(InitialURLContext);
    const routeParams = useTransitionRouteParams();
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
            setForcedTransition(true);
            setExitTo(ROUTES.HOME);
        }, CONST.HYBRID_APP_MAX_TRANSITION_TIMEOUT);
    }, []);

    // Save `exitTo` when we reach /transition route.
    // `exitTo` should always exist during OldDot -> NewDot transitions.
    useEffect(() => {
        if (!NativeModules.HybridAppModule || !routeParams?.exitTo || exitTo) {
            return;
        }

        Log.info('[HybridApp] Saving `exitTo` for later', true, {exitTo: routeParams?.exitTo});
        setExitTo(routeParams?.exitTo);

        Log.info(`[HybridApp] Started transition`, true);
        setStartedTransition(true);
    }, [exitTo, routeParams?.email, routeParams?.exitTo]);

    // This function only affects iOS. If during a single app lifecycle we frequently transition from OldDot to NewDot,
    // we need to artificially show the bootsplash because the app is only booted once.
    const showSplashScreenOnNextStart = useCallback(() => {
        Log.info('[HybridApp] Resetting the state of HybridAppMiddleware to show the BootSplash on the next transition', true);
        setIsSplashHidden(false);
        setStartedTransition(false);
        setFinishedTransition(false);
        setForcedTransition(false);
        setExitTo(undefined);
    }, [setIsSplashHidden]);

    useEffect(() => {
        if (!startedTransition || finishedTransition) {
            return;
        }

        const transitionURL = NativeModules.HybridAppModule ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL ?? undefined, sessionEmail);

        // We need to wait with navigating to exitTo until all login-related actions are complete.
        if ((!authenticated || isLoggingInAsNewUser || isAccountLoading) && !forcedTransition) {
            return;
        }

        if (exitTo) {
            Navigation.isNavigationReady().then(() => {
                if (maxTimeoutRef.current) {
                    clearTimeout(maxTimeoutRef.current);
                }

                // We need to remove /transition from route history.
                // `useTransitionRouteParams` returns undefined for routes other than /transition.
                if (routeParams) {
                    Log.info('[HybridApp] Removing /transition route from history', true);
                    Navigation.goBack();
                }

                Log.info('[HybridApp] Navigating to `exitTo` route', true, {exitTo});
                Navigation.navigate(Navigation.parseHybridAppUrl(exitTo));
                setTimeout(() => {
                    Log.info('[HybridApp] Setting `finishedTransition` to true', true);
                    setFinishedTransition(true);
                }, CONST.SCREEN_TRANSITION_END_TIMEOUT);
            });
        }
    }, [authenticated, exitTo, finishedTransition, forcedTransition, initialURL, isAccountLoading, routeParams, sessionEmail, startedTransition]);

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

    const contextValue = useMemo(
        () => ({
            showSplashScreenOnNextStart,
        }),
        [showSplashScreenOnNextStart],
    );

    return <HybridAppMiddlewareContext.Provider value={contextValue}>{children}</HybridAppMiddlewareContext.Provider>;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
export type {HybridAppMiddlewareContextType};
export {HybridAppMiddlewareContext};
