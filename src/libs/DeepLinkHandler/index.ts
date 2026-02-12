import HybridAppModule from '@expensify/react-native-hybrid-app';
import type {NativeEventSubscription} from 'react-native';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import type {Connection, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import type {OnboardingCompanySize} from '@libs/actions/Welcome/OnboardingFlow';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose, Report} from '@src/types/onyx';

let allReports: OnyxCollection<Report> = {};
let currentConciergeReportID: string | undefined;
let isInitialized = false;
let pendingDeepLinkUrl: string | null = null;

let currentOnboardingPurposeSelected: OnyxEntry<OnboardingPurpose> | undefined;
let currentOnboardingCompanySize: OnyxEntry<OnboardingCompanySize> | undefined;
let onboardingInitialPath: OnyxEntry<string> | undefined;

let linkingEventSubscription: NativeEventSubscription | null = null;

let hasSessionLoaded = false;

const onyxConnections: Connection[] = [];

onyxConnections.push(
    Onyx.connectWithoutView({
        key: ONYXKEYS.SESSION,
        callback: () => {
            if (hasSessionLoaded) {
                return;
            }

            hasSessionLoaded = true;

            initializeDeepLinkHandler();
        },
    }),
);

onyxConnections.push(
    Onyx.connectWithoutView({
        key: ONYXKEYS.CONCIERGE_REPORT_ID,
        callback: (value) => {
            currentConciergeReportID = value ?? undefined;

            initializeDeepLinkHandler();
        },
    }),
);

function processPendingDeepLinkIfReady() {
    if (!pendingDeepLinkUrl) {
        return;
    }

    if (allReports === undefined || currentOnboardingPurposeSelected === undefined || currentOnboardingCompanySize === undefined || onboardingInitialPath === undefined) {
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

    currentConciergeReportID = undefined;
    allReports = undefined;
    currentOnboardingPurposeSelected = undefined;
    currentOnboardingCompanySize = undefined;
    onboardingInitialPath = undefined;
}

function setUpOnyxSubscriptions() {
    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (value) => {
                allReports = value ?? undefined;
                processPendingDeepLinkIfReady();
            },
        }),
    );

    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
            callback: (value) => {
                currentOnboardingPurposeSelected = value ?? undefined;

                processPendingDeepLinkIfReady();
            },
        }),
    );

    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
            callback: (value) => {
                currentOnboardingCompanySize = value ?? undefined;

                processPendingDeepLinkIfReady();
            },
        }),
    );

    onyxConnections.push(
        Onyx.connectWithoutView({
            key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
            callback: (value) => {
                onboardingInitialPath = value ?? undefined;

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

    if (fromUrlChangeEvent && !!allReports && currentOnboardingPurposeSelected !== undefined && currentOnboardingCompanySize !== undefined && onboardingInitialPath !== undefined) {
        const isCurrentlyAuthenticated = hasAuthToken();
        openReportFromDeepLink(url, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated, currentConciergeReportID);
        currentConciergeReportID = undefined;
        allReports = undefined;
        currentOnboardingPurposeSelected = undefined;
        currentOnboardingCompanySize = undefined;
        onboardingInitialPath = undefined;
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
