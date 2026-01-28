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
let areSubscriptionsSetUp = false;
let isInitialized = false;
let pendingDeepLinkUrl: string | null = null;
let isUrlChangeEvent = false;

// Track if reports subscription has received its first callback (required for deep link processing)
let hasReportsReceived = false;

/**
 * Check if all subscriptions are ready and process pending deep link if needed
 */
function processPendingDeepLinkIfReady() {
    if (!pendingDeepLinkUrl) {
        return;
    }

    // Wait for reports subscription to be ready (required)
    // Reports are the only required data - onboarding data is optional
    if (!hasReportsReceived) {
        return;
    }

    // Onboarding data is optional - proceed immediately once reports are ready
    // Use whatever onboarding values we have (may be undefined if user is not in onboarding)
    const urlToProcess = pendingDeepLinkUrl;
    const wasUrlChangeEvent = isUrlChangeEvent;
    pendingDeepLinkUrl = null;
    isUrlChangeEvent = false;

    const isCurrentlyAuthenticated = hasAuthToken();
    openReportFromDeepLink(urlToProcess, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated, wasUrlChangeEvent);

    // Reset flag after processing so future deep links wait for fresh values
    hasReportsReceived = false;
}

/**
 * Set up Onyx subscriptions for deep link handling
 * Only called when there's actually a URL to process
 */
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
            // Try to process if reports are already ready
            processPendingDeepLinkIfReady();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
        callback: (value) => {
            currentOnboardingCompanySize = value;
            // Try to process if reports are already ready
            processPendingDeepLinkIfReady();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
        callback: (value) => {
            onboardingInitialPath = value;
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

/**
 * Handle deep link URL processing
 * @param url - The deep link URL
 * @param fromUrlChangeEvent - True if this is from a URL change event (app already running), false for initial URL
 */
function handleDeepLink(url: string | null, fromUrlChangeEvent = false) {
    if (!url) {
        return;
    }

    // For URL change events (app already running), process immediately with current values
    // React Navigation's linking config will handle the navigation automatically
    if (fromUrlChangeEvent) {
        const isCurrentlyAuthenticated = hasAuthToken();
        openReportFromDeepLink(url, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated, true);
        return;
    }

    // For initial URL (cold start), set up subscriptions and wait for data
    setUpOnyxSubscriptions();

    // Store the URL to process once subscriptions are ready
    pendingDeepLinkUrl = url;
    isUrlChangeEvent = false;

    // Try to process immediately if subscriptions are already set up and ready
    processPendingDeepLinkIfReady();
}

/**
 * Initialize deep link handling by setting up Linking listener
 * Note: Initial URL should be passed via processInitialURL() from Expensify.tsx
 */
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

/**
 * Process an initial URL passed from Expensify.tsx
 * This is called when Expensify.tsx gets the initial URL from Linking.getInitialURL()
 */
function processInitialURL(url: string | null) {
    if (!url) {
        return;
    }
    // Process as initial URL (not a URL change event)
    handleDeepLink(url, false);
}

// Initialize the deep link handler when the module is loaded
// Initial URL will be passed via processInitialURL() from Expensify.tsx
initializeDeepLinkHandler();

export default processInitialURL;
