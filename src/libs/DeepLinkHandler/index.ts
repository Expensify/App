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
    pendingDeepLinkUrl = null;

    const isCurrentlyAuthenticated = hasAuthToken();
    openReportFromDeepLink(urlToProcess, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated);

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
 */
function handleDeepLink(url: string | null) {
    if (!url) {
        return;
    }

    // Set up Onyx subscriptions only when we have a URL to process
    setUpOnyxSubscriptions();

    // Store the URL to process once subscriptions are ready
    pendingDeepLinkUrl = url;

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
        if (!url) {
            return;
        }
        // Only set up subscriptions and handle if URL exists
        handleDeepLink(url as Route | null);
    });

    // Set up listener for URL changes (future deep links)
    Linking.addEventListener('url', (state) => {
        handleDeepLink(state.url);
    });

    if (CONFIG.IS_HYBRID_APP) {
        HybridAppModule.onURLListenerAdded();
    }

    isInitialized = true;
}

// Initialize the deep link handler when the module is loaded
// Onyx subscriptions will only be set up when a URL is detected
initializeDeepLinkHandler();
