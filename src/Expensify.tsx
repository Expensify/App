import HybridAppModule from '@expensify/react-native-hybrid-app';
import * as Sentry from '@sentry/react-native';
import {Audio} from 'expo-av';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {AppState, Linking, Platform} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ConfirmModal from './components/ConfirmModal';
import DelegateNoAccessModalProvider from './components/DelegateNoAccessModalProvider';
import EmojiPicker from './components/EmojiPicker/EmojiPicker';
import GrowlNotification from './components/GrowlNotification';
import {InitialURLContext} from './components/InitialURLContextProvider';
import ProactiveAppReviewModalManager from './components/ProactiveAppReviewModalManager';
import AppleAuthWrapper from './components/SignInButtons/AppleAuthWrapper';
import SplashScreenHider from './components/SplashScreenHider';
import UpdateAppModal from './components/UpdateAppModal';
import CONFIG from './CONFIG';
import CONST from './CONST';
import useDebugShortcut from './hooks/useDebugShortcut';
import useIsAuthenticated from './hooks/useIsAuthenticated';
import useLocalize from './hooks/useLocalize';
import useOnyx from './hooks/useOnyx';
import usePriorityMode from './hooks/usePriorityChange';
import {updateLastRoute} from './libs/actions/App';
import {disconnect} from './libs/actions/Delegate';
import * as EmojiPickerAction from './libs/actions/EmojiPickerAction';
import {openReportFromDeepLink} from './libs/actions/Link';
import * as Report from './libs/actions/Report';
import {hasAuthToken} from './libs/actions/Session';
import * as User from './libs/actions/User';
import * as ActiveClientManager from './libs/ActiveClientManager';
import {isSafari} from './libs/Browser';
import * as Environment from './libs/Environment/Environment';
import FS from './libs/Fullstory';
import Growl, {growlRef} from './libs/Growl';
import Log from './libs/Log';
import migrateOnyx from './libs/migrateOnyx';
import Navigation from './libs/Navigation/Navigation';
import NavigationRoot from './libs/Navigation/NavigationRoot';
import NetworkConnection from './libs/NetworkConnection';
import PushNotification from './libs/Notification/PushNotification';
import './libs/Notification/PushNotification/subscribeToPushNotifications';
// This lib needs to be imported, but it has nothing to export since all it contains is an Onyx connection
import './libs/registerPaginationConfig';
import setCrashlyticsUserId from './libs/setCrashlyticsUserId';
import StartupTimer from './libs/StartupTimer';
import {endSpan, startSpan} from './libs/telemetry/activeSpans';
// This lib needs to be imported, but it has nothing to export since all it contains is an Onyx connection
import './libs/telemetry/TelemetrySynchronizer';
// This lib needs to be imported, but it has nothing to export since all it contains is an Onyx connection
import './libs/UnreadIndicatorUpdater';
import Visibility from './libs/Visibility';
import ONYXKEYS from './ONYXKEYS';
import PopoverReportActionContextMenu from './pages/home/report/ContextMenu/PopoverReportActionContextMenu';
import * as ReportActionContextMenu from './pages/home/report/ContextMenu/ReportActionContextMenu';
import type {Route} from './ROUTES';
import SplashScreenStateContext from './SplashScreenStateContext';
import type {ScreenShareRequest} from './types/onyx';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

Onyx.registerLogger(({level, message, parameters}) => {
    if (level === 'alert') {
        Log.alert(message, parameters);
        console.error(message);

        // useOnyx() calls with "canBeMissing" config set to false will display a visual alert in dev environment
        // when they don't return data.
        const shouldShowAlert = typeof parameters === 'object' && !Array.isArray(parameters) && 'showAlert' in parameters && 'key' in parameters;
        if (Environment.isDevelopment() && shouldShowAlert) {
            Growl.error(`${message} Key: ${parameters.key as string}`, 10000);
        }
    } else if (level === 'hmmm') {
        Log.hmmm(message, parameters);
    } else {
        Log.info(message, undefined, parameters);
    }
});

type ExpensifyProps = {
    /** Whether the app is waiting for the server's response to determine if a room is public */
    isCheckingPublicRoom: OnyxEntry<boolean>;

    /** Whether a new update is available and ready to install. */
    updateAvailable: OnyxEntry<boolean>;

    /** Tells us if the sidebar has rendered */
    isSidebarLoaded: OnyxEntry<boolean>;

    /** Information about a screen share call requested by a GuidesPlus agent */
    screenShareRequest: OnyxEntry<ScreenShareRequest>;

    /** True when the user must update to the latest minimum version of the app */
    updateRequired: OnyxEntry<boolean>;

    /** Last visited path in the app */
    lastVisitedPath: OnyxEntry<string | undefined>;
};
function Expensify() {
    const appStateChangeListener = useRef<NativeEventSubscription | null>(null);
    const linkingChangeListener = useRef<NativeEventSubscription | null>(null);
    const [isNavigationReady, setIsNavigationReady] = useState(false);
    const [isOnyxMigrated, setIsOnyxMigrated] = useState(false);
    const {splashScreenState, setSplashScreenState} = useContext(SplashScreenStateContext);
    const [hasAttemptedToOpenPublicRoom, setAttemptedToOpenPublicRoom] = useState(false);
    const {translate, preferredLocale} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [lastRoute] = useOnyx(ONYXKEYS.LAST_ROUTE, {canBeMissing: true});
    const [userMetadata] = useOnyx(ONYXKEYS.USER_METADATA, {canBeMissing: true});
    const [isCheckingPublicRoom = true] = useOnyx(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, {initWithStoredValues: false, canBeMissing: true});
    const [updateAvailable] = useOnyx(ONYXKEYS.UPDATE_AVAILABLE, {initWithStoredValues: false, canBeMissing: true});
    const [updateRequired] = useOnyx(ONYXKEYS.UPDATE_REQUIRED, {initWithStoredValues: false, canBeMissing: true});
    const [isSidebarLoaded] = useOnyx(ONYXKEYS.IS_SIDEBAR_LOADED, {canBeMissing: true});
    const [screenShareRequest] = useOnyx(ONYXKEYS.SCREEN_SHARE_REQUEST, {canBeMissing: true});
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH, {canBeMissing: true});
    const [currentOnboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [currentOnboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const [onboardingInitialPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS, {canBeMissing: true});
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION, {canBeMissing: true});

    useDebugShortcut();
    usePriorityMode();

    const bootsplashSpan = useRef<Sentry.Span>(null);

    const [initialUrl, setInitialUrl] = useState<Route | null>(null);
    const {setIsAuthenticatedAtStartup} = useContext(InitialURLContext);
    useEffect(() => {
        if (isCheckingPublicRoom) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX);
        setAttemptedToOpenPublicRoom(true);

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION,
            parentSpan: bootsplashSpan.current,
        });
    }, [isCheckingPublicRoom]);

    useEffect(() => {
        bootsplashSpan.current = startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT,
        });

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.ONYX,
            parentSpan: bootsplashSpan.current,
        });

        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.LOCALE,
            parentSpan: bootsplashSpan.current,
        });
    }, []);

    const isAuthenticated = useIsAuthenticated();

    const isSplashReadyToBeHidden = splashScreenState === CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN;
    const isSplashVisible = splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE;

    const shouldInit = isNavigationReady && hasAttemptedToOpenPublicRoom && !!preferredLocale;
    const shouldHideSplash = shouldInit && (CONFIG.IS_HYBRID_APP ? isSplashReadyToBeHidden : isSplashVisible);

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

        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION);

        // Navigate to any pending routes now that the NavigationContainer is ready
        Navigation.setIsNavigationReady();
    }, []);

    const onSplashHide = useCallback(() => {
        setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
        endSpan(CONST.TELEMETRY.SPAN_APP_STARTUP);
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT);
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.SPLASH_HIDER);
    }, [setSplashScreenState]);

    useLayoutEffect(() => {
        // Initialize this client as being an active client
        ActiveClientManager.init();

        // Used for the offline indicator appearing when someone is offline
        const unsubscribeNetInfo = NetworkConnection.subscribeToNetInfo(session?.accountID);

        return unsubscribeNetInfo;
    }, [session?.accountID]);

    useEffect(() => {
        // Initialize Fullstory lib
        FS.init(userMetadata);
        FS.getSessionURL().then((url) => {
            if (!url) {
                return;
            }
            Sentry.setContext(CONST.TELEMETRY.CONTEXT_FULLSTORY, {url});
        });
    }, [userMetadata]);

    // Log the platform and config to debug .env issues
    useEffect(() => {
        Log.info('App launched', false, {Platform, CONFIG});
    }, []);

    useEffect(() => {
        if (isLoadingOnyxValue(sessionMetadata)) {
            return;
        }
        setTimeout(() => {
            const appState = AppState.currentState;
            Log.info('[BootSplash] splash screen status', false, {appState, splashScreenState});

            if (splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE) {
                const propsToLog: Omit<ExpensifyProps & {isAuthenticated: boolean}, 'children' | 'session'> = {
                    isCheckingPublicRoom,
                    updateRequired,
                    updateAvailable,
                    isSidebarLoaded,
                    screenShareRequest,
                    isAuthenticated,
                    lastVisitedPath,
                };
                Log.alert('[BootSplash] splash screen is still visible', {propsToLog}, false);
            }
        }, 30 * 1000);

        // This timer is set in the native layer when launching the app and we stop it here so we can measure how long
        // it took for the main app itself to load.
        StartupTimer.stop();

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
        // If the app is opened from a deep link, get the reportID (if exists) from the deep link and navigate to the chat report
        Linking.getInitialURL().then((url) => {
            setInitialUrl(url as Route);
            if (url) {
                openReportFromDeepLink(url, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isAuthenticated);
            } else {
                Report.doneCheckingPublicRoom();
            }
        });

        // Open chat report from a deep link (only mobile native)
        linkingChangeListener.current = Linking.addEventListener('url', (state) => {
            const isCurrentlyAuthenticated = hasAuthToken();
            openReportFromDeepLink(state.url, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated);
        });
        if (CONFIG.IS_HYBRID_APP) {
            HybridAppModule.onURLListenerAdded();
        }

        return () => {
            if (appStateChangeListener.current) {
                appStateChangeListener.current.remove();
            }
            if (!linkingChangeListener.current) {
                return;
            }
            linkingChangeListener.current.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, [sessionMetadata?.status]);

    // This is being done since we want to play sound even when iOS device is on silent mode, to align with other platforms.
    useEffect(() => {
        Audio.setAudioModeAsync({playsInSilentModeIOS: true});
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
        if (!isAuthenticated) {
            return;
        }
        setCrashlyticsUserId(session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
    }, [isAuthenticated, session?.accountID]);

    useEffect(() => {
        if (!account?.delegatedAccess?.delegate) {
            return;
        }
        if (account?.delegatedAccess?.delegates?.some((d) => d.email === account?.delegatedAccess?.delegate)) {
            return;
        }
        disconnect({stashedCredentials, stashedSession});
    }, [account?.delegatedAccess?.delegates, account?.delegatedAccess?.delegate, stashedCredentials, stashedSession]);

    // Display a blank page until the onyx migration completes
    if (!isOnyxMigrated) {
        return null;
    }

    if (updateRequired) {
        throw new Error(CONST.ERROR.UPDATE_REQUIRED);
    }

    return (
        <>
            {shouldInit && (
                <>
                    <GrowlNotification ref={growlRef} />
                    <DelegateNoAccessModalProvider>
                        <PopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
                    </DelegateNoAccessModalProvider>
                    <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
                    {/* We include the modal for showing a new update at the top level so the option is always present. */}
                    {updateAvailable && !updateRequired ? <UpdateAppModal /> : null}
                    {/* Proactive app review modal shown when user has completed a trigger action */}
                    <ProactiveAppReviewModalManager />
                    {screenShareRequest ? (
                        <ConfirmModal
                            title={translate('guides.screenShare')}
                            onConfirm={() => User.joinScreenShare(screenShareRequest.accessToken, screenShareRequest.roomName)}
                            onCancel={User.clearScreenShareRequest}
                            prompt={translate('guides.screenShareRequest')}
                            confirmText={translate('common.join')}
                            cancelText={translate('common.decline')}
                            isVisible
                        />
                    ) : null}
                </>
            )}

            <AppleAuthWrapper />
            {hasAttemptedToOpenPublicRoom && (
                <NavigationRoot
                    onReady={setNavigationReady}
                    authenticated={isAuthenticated}
                    lastVisitedPath={lastVisitedPath as Route}
                    initialUrl={initialUrl}
                />
            )}
            {shouldHideSplash && <SplashScreenHider onHide={onSplashHide} />}
        </>
    );
}

export default Expensify;
