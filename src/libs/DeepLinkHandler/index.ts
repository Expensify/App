import HybridAppModule from '@expensify/react-native-hybrid-app';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import type {OnboardingCompanySize, OnboardingPurpose} from '@libs/actions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

// Module-level state to store Onyx values
let currentOnboardingPurposeSelected: OnyxEntry<OnboardingPurpose>;
let currentOnboardingCompanySize: OnyxEntry<OnboardingCompanySize>;
let onboardingInitialPath: OnyxEntry<string>;
let allReports: OnyxCollection<Report> = {};
let currentConciergeReportID: string | undefined;
let areSubscriptionsSetUp = false;
let isInitialized = false;
let pendingDeepLinkUrl: string | null = null;


let hasReportsReceived = false;
let hasOnboardingPurposeSelectedReceived = false;
let hasOnboardingCompanySizeReceived = false;
let hasOnboardingInitialPathReceived = false;

// Track if session has been loaded (similar to isLoadingOnyxValue check in Expensify.tsx)
let hasSessionLoaded = false;

function startModule() {
    Onyx.connectWithoutView({
        key: ONYXKEYS.SESSION,
        callback: () => {
            // Session callback fired = session is loaded (equivalent to !isLoadingOnyxValue)
            // Only initialize once (prevent duplicate initialization if callback fires multiple times)
            if (hasSessionLoaded) {
                return; // Already initialized, skip
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

    // Wait for reports subscription to be ready (required)
    // Reports are the only required data - onboarding data is optional
    if (!hasReportsReceived || !hasOnboardingPurposeSelectedReceived || !hasOnboardingCompanySizeReceived || !hasOnboardingInitialPathReceived) {
        return;
    }

    // Onboarding data is optional - proceed immediately once reports are ready
    // Use whatever onboarding values we have (may be undefined if user is not in onboarding)
    const urlToProcess = pendingDeepLinkUrl;
    pendingDeepLinkUrl = null;

    const isCurrentlyAuthenticated = hasAuthToken();
    openReportFromDeepLink(
        urlToProcess,
        currentOnboardingPurposeSelected,
        currentOnboardingCompanySize,
        onboardingInitialPath,
        allReports,
        isCurrentlyAuthenticated,
        currentConciergeReportID,
    );

    // Reset flag after processing so future deep links wait for fresh values
    hasReportsReceived = false;
}


function setUpOnyxSubscriptions() {
    if (areSubscriptionsSetUp) {
        return;
    }

    // Subscribe to Onyx keys using connectWithoutView since this is a non-UI module
    // Onboarding data is optional - we still subscribe to update values, but don't wait for them
    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
        callback: (value) => {
            currentOnboardingPurposeSelected = value;
            hasOnboardingPurposeSelectedReceived = true;
            // Try to process if reports are already ready
            processPendingDeepLinkIfReady();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
        callback: (value) => {
            currentOnboardingCompanySize = value;
            hasOnboardingCompanySizeReceived = true;
            // Try to process if reports are already ready
            processPendingDeepLinkIfReady();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
        callback: (value) => {
            onboardingInitialPath = value;
            hasOnboardingInitialPathReceived = true;
            // Try to process if reports are already ready
            processPendingDeepLinkIfReady();
        },
    });

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

    // For URL change events (app already running), process immediately with current values
    // React Navigation's linking config will handle the navigation automatically
    if (fromUrlChangeEvent) {
        const isCurrentlyAuthenticated = hasAuthToken();
        openReportFromDeepLink(
            url,
            currentOnboardingPurposeSelected,
            currentOnboardingCompanySize,
            onboardingInitialPath,
            allReports,
            isCurrentlyAuthenticated,
            currentConciergeReportID,
        );
        return;
    }

    // For initial URL (cold start), set up subscriptions and wait for data
    setUpOnyxSubscriptions();

    // Store the URL to process once subscriptions are ready
    pendingDeepLinkUrl = url;

    // Try to process immediately if subscriptions are already set up and ready
    processPendingDeepLinkIfReady();
}

function initializeDeepLinkHandler() {
    if (isInitialized) {
        return;
    }

    // Set up listener for URL changes (future deep links)
    // For URL change events, React Navigation's linking config handles navigation automatically
    Linking.addEventListener('url', (state) => {
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
    // Process as initial URL (not a URL change event)
    handleDeepLink(url, false);
}

startModule();

export {processInitialURL, startModule};
