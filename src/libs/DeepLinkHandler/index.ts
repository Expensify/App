import HybridAppModule from '@expensify/react-native-hybrid-app';
import type {NativeEventSubscription} from 'react-native';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

let allReports: OnyxCollection<Report> = {};
let currentConciergeReportID: string | undefined;
let areSubscriptionsSetUp = false;
let isInitialized = false;
let pendingDeepLinkUrl: string | null = null;

let hasReportsReceived = false;

let linkinEventSubscription: NativeEventSubscription | null = null;

let hasSessionLoaded = false;

function startModule() {
    Onyx.connectWithoutView({
        key: ONYXKEYS.SESSION,
        callback: () => {
            if (hasSessionLoaded) {
                return;
            }

            hasSessionLoaded = true;

            initializeDeepLinkHandler();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.CONCIERGE_REPORT_ID,
        callback: (value) => {
            currentConciergeReportID = value ?? undefined;
        },
    });
}

function processPendingDeepLinkIfReady() {
    if (!pendingDeepLinkUrl) {
        return;
    }

    if (!hasReportsReceived) {
        return;
    }

    const urlToProcess = pendingDeepLinkUrl;
    pendingDeepLinkUrl = null;

    const isCurrentlyAuthenticated = hasAuthToken();
    openReportFromDeepLink(urlToProcess, allReports, isCurrentlyAuthenticated, currentConciergeReportID);
}

function setUpOnyxSubscriptions() {
    if (areSubscriptionsSetUp) {
        return;
    }

    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT,
        waitForCollectionCallback: true,
        callback: (value) => {
            allReports = value ?? {};
            hasReportsReceived = true;
            processPendingDeepLinkIfReady();
        },
    });

    areSubscriptionsSetUp = true;
}

function handleDeepLink(url: string | null, fromUrlChangeEvent: boolean) {
    if (!url) {
        return;
    }

    if (fromUrlChangeEvent) {
        const isCurrentlyAuthenticated = hasAuthToken();
        openReportFromDeepLink(url, allReports, isCurrentlyAuthenticated, currentConciergeReportID);
        return;
    }

    setUpOnyxSubscriptions();

    hasReportsReceived = false;

    pendingDeepLinkUrl = url;

    processPendingDeepLinkIfReady();
}

function initializeDeepLinkHandler() {
    if (isInitialized) {
        return;
    }

    linkinEventSubscription = Linking.addEventListener('url', (state) => {
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
    linkinEventSubscription?.remove();
    linkinEventSubscription = null;
}

startModule();

export {processInitialURL, startModule, clearModule};
