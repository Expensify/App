import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {setIsGPSInProgressModalOpen} from '@userActions/isGPSInProgressModalOpen';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type HybridAppSettings from './types';

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

function closeReactNativeApp({shouldSetNVP, isTrackingGPS}: {shouldSetNVP: boolean; isTrackingGPS: boolean}) {
    if (isTrackingGPS) {
        setIsGPSInProgressModalOpen(true);
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
