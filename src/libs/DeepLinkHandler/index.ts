import HybridAppModule from '@expensify/react-native-hybrid-app';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import type {OnboardingCompanySize, OnboardingPurpose} from '@libs/actions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
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

// Track which subscriptions have received their first callback
let hasOnboardingPurposeReceived = false;
let hasOnboardingCompanySizeReceived = false;
let hasOnboardingInitialPathReceived = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hasReportsReceived = false;

/**
 * Check if all subscriptions are ready and process pending deep link if needed
 */
function processPendingDeepLinkIfReady() {
    if (!pendingDeepLinkUrl) {
        return;
    }

    // Wait for all subscriptions to be ready (at least one callback fired)
    if (!hasOnboardingPurposeReceived || !hasOnboardingCompanySizeReceived || !hasOnboardingInitialPathReceived || !hasReportsReceived) {
        return;
    }

    const urlToProcess = pendingDeepLinkUrl;
    const wasUrlChangeEvent = isUrlChangeEvent;
    pendingDeepLinkUrl = null;
    isUrlChangeEvent = false;

    const isCurrentlyAuthenticated = hasAuthToken();
    console.log('[DeepLinkHandler] Processing deep link:', urlToProcess, 'isAuthenticated:', isCurrentlyAuthenticated, 'reports count:', Object.keys(allReports ?? {}).length, 'isUrlChangeEvent:', wasUrlChangeEvent);
    openReportFromDeepLink(urlToProcess, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated, wasUrlChangeEvent);

    // Reset flags after processing so future deep links wait for fresh values
    hasOnboardingPurposeReceived = false;
    hasOnboardingCompanySizeReceived = false;
    hasOnboardingInitialPathReceived = false;
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
    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
        callback: (value) => {
            currentOnboardingPurposeSelected = value;
            hasOnboardingPurposeReceived = true;
            processPendingDeepLinkIfReady();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
        callback: (value) => {
            currentOnboardingCompanySize = value;
            hasOnboardingCompanySizeReceived = true;
            processPendingDeepLinkIfReady();
        },
    });

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
        callback: (value) => {
            onboardingInitialPath = value;
            hasOnboardingInitialPathReceived = true;
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
    console.log('[DeepLinkHandler] handleDeepLink called with url:', url, 'pendingDeepLinkUrl:', pendingDeepLinkUrl, 'areSubscriptionsSetUp:', areSubscriptionsSetUp, 'fromUrlChangeEvent:', fromUrlChangeEvent);
    if (!url) {
        return;
    }

    // For URL change events (app already running), process immediately with current values
    // React Navigation's linking config will handle the navigation automatically
    if (fromUrlChangeEvent) {
        const isCurrentlyAuthenticated = hasAuthToken();
        console.log('[DeepLinkHandler] URL change event, processing immediately with current values, isAuthenticated:', isCurrentlyAuthenticated);
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
 */
function initializeDeepLinkHandler() {
    if (isInitialized) {
        return;
    }

    // Check for initial URL first
    Linking.getInitialURL().then((url) => {
        console.log('[DeepLinkHandler] getInitialURL resolved with:', url);
        if (!url) {
            return;
        }
        // Only set up subscriptions and handle if URL exists
        handleDeepLink(url as Route | null);
    });

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

// Initialize the deep link handler when the module is loaded
// Onyx subscriptions will only be set up when a URL is detected
initializeDeepLinkHandler();
