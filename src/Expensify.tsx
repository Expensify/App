import HybridAppModule from '@expensify/react-native-hybrid-app';
import type * as Sentry from '@sentry/react-native';
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {AppState, Linking, Platform} from 'react-native';
import Onyx from 'react-native-onyx';
import {useInitialURLActions} from './components/InitialURLContextProvider';
import AppleAuthWrapper from './components/SignInButtons/AppleAuthWrapper';
import SplashScreenHider from './components/SplashScreenHider';
import CONFIG from './CONFIG';
import CONST from './CONST';
import DelegateAccessHandler from './DelegateAccessHandler';
import FullstoryInitHandler from './FullstoryInitHandler';
import GlobalModals from './GlobalModals';
import useArchivedReportsIdSet from './hooks/useArchivedReportsIDSet';
import useDebugShortcut from './hooks/useDebugShortcut';
import useIsAuthenticated from './hooks/useIsAuthenticated';
import useLocalize from './hooks/useLocalize';
import useOnyx from './hooks/useOnyx';
import {updateLastRoute} from './libs/actions/App';
import {openReportFromDeepLink} from './libs/actions/Link';
import * as Report from './libs/actions/Report';
import {hasAuthToken} from './libs/actions/Session';
import * as ActiveClientManager from './libs/ActiveClientManager';
import {isSafari} from './libs/Browser';
import Log from './libs/Log';
import migrateOnyx from './libs/migrateOnyx';
import Navigation from './libs/Navigation/Navigation';
import NavigationRoot from './libs/Navigation/NavigationRoot';
import NetworkConnection from './libs/NetworkConnection';
import PushNotification from './libs/Notification/PushNotification';
import {endSpan, getSpan, startSpan} from './libs/telemetry/activeSpans';
import type {BootsplashGateStatus} from './libs/telemetry/bootsplashTelemetry';
import {startBootsplashMonitor} from './libs/telemetry/bootsplashTelemetry';
import {cleanupMemoryTrackingTelemetry, initializeMemoryTrackingTelemetry} from './libs/telemetry/TelemetrySynchronizer';
import Visibility from './libs/Visibility';
import ONYXKEYS from './ONYXKEYS';
import PriorityModeHandler from './PriorityModeHandler';
import type {Route} from './ROUTES';
import {hasSeenTourSelector} from './selectors/Onboarding';
import {accountIDSelector} from './selectors/Session';
import {useSplashScreenActions, useSplashScreenState} from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

Onyx.registerLogger(({level, message, parameters}) => {
    if (level === 'alert') {
        Log.alert(message, parameters);
        console.error(message);
    } else if (level === 'hmmm') {
        Log.hmmm(message, parameters);
    } else {
        Log.info(message, undefined, parameters);
    }
});

function Expensify() {
    const appStateChangeListener = useRef<NativeEventSubscription | null>(null);
    const linkingChangeListener = useRef<NativeEventSubscription | null>(null);
    const [isNavigationReady, setIsNavigationReady] = useState(false);
    const [isOnyxMigrated, setIsOnyxMigrated] = useState(false);
    const {splashScreenState} = useSplashScreenState();
    const {setSplashScreenState} = useSplashScreenActions();
    const [hasAttemptedToOpenPublicRoom, setAttemptedToOpenPublicRoom] = useState(false);
    const {preferredLocale} = useLocalize();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);
    const [lastRoute] = useOnyx(ONYXKEYS.LAST_ROUTE);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [isCheckingPublicRoom = true] = useOnyx(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, {initWithStoredValues: false});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed, isSelfTourViewedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [updateRequired] = useOnyx(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED);
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const archivedReportsIDSet = useArchivedReportsIdSet();

    useDebugShortcut();

    useEffect(() => {
        initializeMemoryTrackingTelemetry();
        return () => {
            cleanupMemoryTrackingTelemetry();
        };
    }, []);

    const bootsplashSpan = useRef<Sentry.Span>(null);

    const [initialUrl, setInitialUrl] = useState<Route | null>(null);
    const {setIsAuthenticatedAtStartup} = useInitialURLActions();

    useEffect(() => {
        bootsplashSpan.current =
            startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT, {
                name: CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT,
                op: CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT,
                parentSpan: getSpan(CONST.TELEMETRY.SPAN_APP_STARTUP),
            }) ?? null;

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX,
            parentSpan: bootsplashSpan.current,
        });

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_CHECK, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_CHECK,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_CHECK,
            parentSpan: bootsplashSpan.current,
        });

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE,
            parentSpan: bootsplashSpan.current,
        });
    }, []);

    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (isCheckingPublicRoom) {
            return;
        }

        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX);

        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_CHECK);

        // End the PUBLIC_ROOM_API span if it was started (it's started conditionally in openReportFromDeepLink)
        // endSpan handles non-existent spans gracefully, so it's safe to call unconditionally
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_API);

        setAttemptedToOpenPublicRoom(true);

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION,
            parentSpan: bootsplashSpan.current,
        });
    }, [isCheckingPublicRoom]);

    useEffect(() => {
        if (!preferredLocale) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE);
    }, [preferredLocale]);

    const isSplashReadyToBeHidden = splashScreenState === CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN;
    const isSplashVisible = splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE;

    const shouldInit = isNavigationReady && hasAttemptedToOpenPublicRoom && !!preferredLocale;
    const shouldHideSplash = shouldInit && (CONFIG.IS_HYBRID_APP ? isSplashReadyToBeHidden : isSplashVisible);

    // We store this in a ref to get the latest values in BootsplashMonitor callback
    const gateStatusRef = useRef<BootsplashGateStatus | null>(null);
    gateStatusRef.current = {
        splashScreenState,
        isOnyxMigrated,
        isCheckingPublicRoom,
        hasAttemptedToOpenPublicRoom,
        isNavigationReady,
        preferredLocale,
        shouldInit,
        shouldHideSplash,
        isAuthenticated,
        updateRequired,
        lastVisitedPath,
    };

    useEffect(() => {
        if (!shouldHideSplash) {
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER,
            parentSpan: bootsplashSpan.current,
        });
    }, [shouldHideSplash]);

    useEffect(() => {
        if (!shouldInit || splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN) {
            return;
        }

        // Clears OldDot UI after sign-out, if there's no OldDot UI left it has no effect.
        HybridAppModule.clearOldDotAfterSignOut();
    }, [shouldInit, splashScreenState]);

    const initializeClient = () => {
        if (!Visibility.isVisible()) {
            return;
        }

        // Delay client init to avoid issues with delayed Onyx events on iOS. All iOS browsers use WebKit, which suspends events in background tabs.
        // Events are flushed only when the tab becomes active again causing issues with client initialization.
        // See: https://stackoverflow.com/questions/54095584/page-becomes-inactive-when-switching-tabs-on-ios
        if (isSafari()) {
            setTimeout(ActiveClientManager.init, 400);
        } else {
            ActiveClientManager.init();
        }
    };

    const setNavigationReady = useCallback(() => {
        setIsNavigationReady(true);

        // Navigate to any pending routes now that the NavigationContainer is ready
        Navigation.setIsNavigationReady();
    }, []);

    const onSplashHide = useCallback(() => {
        setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
        endSpan(CONST.TELEMETRY.SPAN_OD_ND_TRANSITION);
        endSpan(CONST.TELEMETRY.SPAN_APP_STARTUP);
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT);
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER);
    }, [setSplashScreenState]);

    useLayoutEffect(() => {
        // Initialize this client as being an active client
        ActiveClientManager.init();

        // Used for the offline indicator appearing when someone is offline
        const unsubscribeNetInfo = NetworkConnection.subscribeToNetInfo(accountID);

        return unsubscribeNetInfo;
    }, [accountID]);

    // Log the platform and config to debug .env issues
    useEffect(() => {
        Log.info('App launched', false, {Platform, CONFIG});
    }, []);

    useEffect(() => {
        return startBootsplashMonitor(gateStatusRef);
    }, []);

    useEffect(() => {
        // Run any Onyx schema migrations and then continue loading the main app
        migrateOnyx().then(() => {
            // In case of a crash that led to disconnection, we want to remove all the push notifications.
            if (!isAuthenticated) {
                PushNotification.clearNotifications();
            }

            setIsOnyxMigrated(true);
        });

        appStateChangeListener.current = AppState.addEventListener('change', initializeClient);

        setIsAuthenticatedAtStartup(isAuthenticated);

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.DEEP_LINK, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.DEEP_LINK,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.DEEP_LINK,
            parentSpan: bootsplashSpan.current,
        });

        if (CONFIG.IS_HYBRID_APP) {
            HybridAppModule.onURLListenerAdded();
        }

        return () => {
            appStateChangeListener.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, []);

    useLayoutEffect(() => {
        if (!isNavigationReady || !lastRoute) {
            return;
        }
        updateLastRoute('');
        Navigation.navigate(lastRoute as Route);
        // Disabling this rule because we only want it to run on the first render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNavigationReady]);

    useEffect(() => {
        if (isLoadingOnyxValue(sessionMetadata, isSelfTourViewedMetadata)) {
            return;
        }

        Linking.getInitialURL().then((url) => {
            setInitialUrl(url as Route);

            if (url) {
                if (conciergeReportID === undefined) {
                    Log.info('[Deep link] conciergeReportID is undefined when processing initial URL', false, {url});
                }
                if (introSelected === undefined) {
                    Log.info('[Deep link] introSelected is undefined when processing initial URL', false, {url});
                }
                openReportFromDeepLink(url, allReports, isAuthenticated, conciergeReportID, introSelected, isSelfTourViewed, archivedReportsIDSet, betas);
            } else {
                Report.doneCheckingPublicRoom();
            }

            endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.DEEP_LINK);
        });

        linkingChangeListener.current = Linking.addEventListener('url', (state) => {
            if (conciergeReportID === undefined) {
                Log.info('[Deep link] conciergeReportID is undefined when processing URL change', false, {url: state.url});
            }
            if (introSelected === undefined) {
                Log.info('[Deep link] introSelected is undefined when processing URL change', false, {url: state.url});
            }
            const isCurrentlyAuthenticated = hasAuthToken();
            openReportFromDeepLink(state.url, allReports, isCurrentlyAuthenticated, conciergeReportID, introSelected, isSelfTourViewed, archivedReportsIDSet, betas);
        });

        return () => {
            linkingChangeListener.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this bootstrap should only rerun when session metadata or concierge routing changes
    }, [sessionMetadata?.status, conciergeReportID, isSelfTourViewedMetadata]);

    // Display a blank page until the onyx migration completes
    if (!isOnyxMigrated) {
        return null;
    }

    if (updateRequired) {
        throw new Error(CONST.ERROR.UPDATE_REQUIRED);
    }

    return (
        <>
            {shouldInit && <GlobalModals />}
            <PriorityModeHandler />
            <DelegateAccessHandler />
            <FullstoryInitHandler />
            <AppleAuthWrapper />
            {hasAttemptedToOpenPublicRoom && (
                <NavigationRoot
                    onReady={setNavigationReady}
                    authenticated={isAuthenticated}
                    lastVisitedPath={lastVisitedPath as Route}
                    initialUrl={initialUrl}
                />
            )}
            {(isSplashVisible || isSplashReadyToBeHidden) && (
                <SplashScreenHider
                    shouldHideSplash={shouldHideSplash}
                    onHide={onSplashHide}
                />
            )}
        </>
    );
}

export default Expensify;
