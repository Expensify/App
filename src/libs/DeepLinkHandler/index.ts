import HybridAppModule from '@expensify/react-native-hybrid-app';
import type {NativeEventSubscription} from 'react-native';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type {Connection, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected, Report} from '@src/types/onyx';

let allReports: OnyxCollection<Report> = {};
let currentConciergeReportID: string | undefined;
let isInitialized = false;
let pendingDeepLinkUrl: string | null = null;

let introSelected: OnyxEntry<IntroSelected> | undefined;

let hasAllReportsLoaded = false;
let hasIntroSelectedLoaded = false;
let hasCurrentConciergeReportIDLoaded = false;

let linkingEventSubscription: NativeEventSubscription | null = null;

const onyxConnections: Connection[] = [];

onyxConnections.push(
    Onyx.connectWithoutView({
        key: ONYXKEYS.SESSION,
        callback: () => {
            initializeDeepLinkHandler();
        },
    }),
);

function processPendingDeepLinkIfReady() {
    if (!pendingDeepLinkUrl) {
        return;
    }

    if (hasAllReportsLoaded === false || hasIntroSelectedLoaded === false || hasCurrentConciergeReportIDLoaded === false) {
        return;
    }

    const urlToProcess = pendingDeepLinkUrl;
    pendingDeepLinkUrl = null;

    const isCurrentlyAuthenticated = hasAuthToken();
    openReportFromDeepLink(urlToProcess, allReports, isCurrentlyAuthenticated, currentConciergeReportID, introSelected);

    hasAllReportsLoaded = false;
    hasIntroSelectedLoaded = false;
    hasCurrentConciergeReportIDLoaded = false;
}

function setUpOnyxSubscriptions() {
    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (value) => {
                allReports = value ?? undefined;
                hasAllReportsLoaded = true;
                processPendingDeepLinkIfReady();
            },
        }),
    );

    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            callback: (value) => {
                hasIntroSelectedLoaded = true;
                if (value === undefined) {
                    Log.info('[Deep link] introSelected is undefined when processing initial URL', false, {url: pendingDeepLinkUrl});
                }
                processPendingDeepLinkIfReady();
            },
        }),
    );

    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.CONCIERGE_REPORT_ID,
            callback: (value) => {
                if (value === undefined) {
                    Log.info('[Deep link] conciergeReportID is undefined when processing URL change', false, {url: pendingDeepLinkUrl});
                }
                currentConciergeReportID = value ?? undefined;
                hasCurrentConciergeReportIDLoaded = true;
                processPendingDeepLinkIfReady();
            },
        }),
    );
}

function handleDeepLink(url: string | null, fromUrlChangeEvent: boolean) {
    if (!url) {
        return;
    }

    pendingDeepLinkUrl = url;

    if (fromUrlChangeEvent && hasAllReportsLoaded && hasIntroSelectedLoaded && hasCurrentConciergeReportIDLoaded) {
        const isCurrentlyAuthenticated = hasAuthToken();
        openReportFromDeepLink(url, allReports, isCurrentlyAuthenticated, currentConciergeReportID, introSelected);
        hasAllReportsLoaded = false;
        hasIntroSelectedLoaded = false;
        hasCurrentConciergeReportIDLoaded = false;
        return;
    }

    setUpOnyxSubscriptions();

    processPendingDeepLinkIfReady();
}

function initializeDeepLinkHandler() {
    if (isInitialized) {
        return;
    }

    linkingEventSubscription = Linking.addEventListener('url', (state) => {
        handleDeepLink(state.url, true);
    });

    if (CONFIG.IS_HYBRID_APP) {
        HybridAppModule.onURLListenerAdded();
    }

    isInitialized = true;
}

function processInitialURL(url: string | null) {
    if (!url) {
        return;
    }

    handleDeepLink(url, false);
}

function clearModule() {
    linkingEventSubscription?.remove();
    linkingEventSubscription = null;

    for (const connection of onyxConnections) {
        Onyx.disconnect(connection);
    }
}

export {processInitialURL, clearModule};
