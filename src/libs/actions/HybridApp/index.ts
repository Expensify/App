import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {isLockedToNewApp, shouldBlockOldAppExit} from '@libs/TryNewDotUtils';
import {setIsGPSInProgressModalOpen} from '@userActions/isGPSInProgressModalOpen';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session, TryNewDot} from '@src/types/onyx';
import type HybridAppSettings from './types';

let currentTryNewDot: OnyxEntry<TryNewDot>;
let currentSessionAccountID: Session['accountID'];
let isLoadingApp = true;
let isLoadingTryNewDot = true;
let hasReceivedTryNewDotUpdate = false;

function getSessionAccountID(session: OnyxEntry<Session>): Session['accountID'] {
    return session?.accountID;
}

function updateTryNewDotLoadingState(isTryNewDotUpdate = false, isInitialTryNewDotUpdate = false) {
    if (currentTryNewDot !== undefined) {
        isLoadingTryNewDot = false;
        return;
    }

    if (isTryNewDotUpdate && !isInitialTryNewDotUpdate && isLoadingTryNewDot === false) {
        isLoadingTryNewDot = true;
        return;
    }

    isLoadingTryNewDot = isLoadingApp !== false;
}

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (tryNewDot) => {
        const isInitialTryNewDotUpdate = !hasReceivedTryNewDotUpdate;
        hasReceivedTryNewDotUpdate = true;
        currentTryNewDot = tryNewDot;
        updateTryNewDotLoadingState(true, isInitialTryNewDotUpdate);
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (loadingApp) => {
        isLoadingApp = loadingApp ?? true;
        updateTryNewDotLoadingState();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const nextSessionAccountID = getSessionAccountID(session);
        if (nextSessionAccountID === currentSessionAccountID) {
            return;
        }

        currentSessionAccountID = nextSessionAccountID;
        currentTryNewDot = undefined;
        hasReceivedTryNewDotUpdate = false;
        isLoadingTryNewDot = nextSessionAccountID !== undefined || isLoadingApp !== false;
    },
});

/*
 * Parses initial settings passed from OldDot app
 */
function parseHybridAppSettings(hybridAppSettings: string | null): HybridAppSettings | null {
    if (!hybridAppSettings) {
        return null;
    }

    return JSON.parse(hybridAppSettings) as HybridAppSettings;
}

function getHybridAppSettings(): Promise<HybridAppSettings | null> {
    return HybridAppModule.getHybridAppSettings().then((hybridAppSettings) => {
        return parseHybridAppSettings(hybridAppSettings);
    });
}

type CloseReactNativeAppParams = {
    shouldSetNVP: boolean;
    isTrackingGPS: boolean;
    shouldIgnoreTryNewDotLoading?: boolean;
};

function closeReactNativeApp({shouldSetNVP, isTrackingGPS, shouldIgnoreTryNewDotLoading = false}: CloseReactNativeAppParams) {
    if (isLockedToNewApp(currentTryNewDot)) {
        return;
    }

    if (isTrackingGPS) {
        setIsGPSInProgressModalOpen(true);
        return;
    }

    if (!shouldIgnoreTryNewDotLoading && shouldBlockOldAppExit(currentTryNewDot, isLoadingTryNewDot, shouldSetNVP)) {
        return;
    }

    Navigation.clearPreloadedRoutes();
    if (CONFIG.IS_HYBRID_APP) {
        Onyx.merge(ONYXKEYS.HYBRID_APP, {closingReactNativeApp: true});
    }

    // eslint-disable-next-line no-restricted-properties
    HybridAppModule.closeReactNativeApp({shouldSetNVP});
}

/*
 * Changes value of `readyToShowAuthScreens`
 */
function setReadyToShowAuthScreens(readyToShowAuthScreens: boolean) {
    // This value is only relevant for HybridApp, so we can skip it in other environments.
    if (!CONFIG.IS_HYBRID_APP) {
        return;
    }
    Onyx.merge(ONYXKEYS.HYBRID_APP, {readyToShowAuthScreens});
}

function setUseNewDotSignInPage(useNewDotSignInPage: boolean) {
    // This value is only relevant for HybridApp, so we can skip it in other environments.
    if (!CONFIG.IS_HYBRID_APP) {
        return Promise.resolve();
    }
    return Onyx.merge(ONYXKEYS.HYBRID_APP, {useNewDotSignInPage});
}

function setClosingReactNativeApp(closingReactNativeApp: boolean) {
    // This value is only relevant for HybridApp, so we can skip it in other environments.
    if (!CONFIG.IS_HYBRID_APP) {
        return;
    }
    Onyx.merge(ONYXKEYS.HYBRID_APP, {closingReactNativeApp});
}

/*
 * Starts HybridApp sign-in flow from the beginning.
 */
function resetSignInFlow() {
    // This value is only relevant for HybridApp, so we can skip it in other environments.
    if (!CONFIG.IS_HYBRID_APP) {
        return Promise.resolve();
    }

    return Onyx.merge(ONYXKEYS.HYBRID_APP, {
        readyToShowAuthScreens: false,
        useNewDotSignInPage: true,
    });
}

export {getHybridAppSettings, setReadyToShowAuthScreens, resetSignInFlow, setUseNewDotSignInPage, setClosingReactNativeApp, closeReactNativeApp};
