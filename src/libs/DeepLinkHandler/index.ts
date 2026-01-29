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

    if (!hasReportsReceived || !hasOnboardingPurposeSelectedReceived || !hasOnboardingCompanySizeReceived || !hasOnboardingInitialPathReceived) {
        return;
    }

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

    hasReportsReceived = false;
}

function setUpOnyxSubscriptions() {
    if (areSubscriptionsSetUp) {
        return;
    }

    Onyx.connectWithoutView({
        key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
        callback: (value) => {
            currentOnboardingPurposeSelected = value;
            hasOnboardingPurposeSelectedReceived = true;

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

function handleDeepLink(url: string | null, fromUrlChangeEvent: boolean) {
    if (!url) {
        return;
    }

    if (fromUrlChangeEvent) {
        const isCurrentlyAuthenticated = hasAuthToken();
        openReportFromDeepLink(url, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated, currentConciergeReportID);
        return;
    }

    setUpOnyxSubscriptions();

    pendingDeepLinkUrl = url;

    processPendingDeepLinkIfReady();
}

function initializeDeepLinkHandler() {
    if (isInitialized) {
        return;
    }

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

    handleDeepLink(url, false);
}

startModule();

export {processInitialURL, startModule};
