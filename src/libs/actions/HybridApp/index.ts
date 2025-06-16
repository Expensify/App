import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {HybridApp} from '@src/types/onyx';
import type HybridAppSettings from './types';

/*
 * Parses initial settings passed from OldDot app
 */
function parseHybridAppSettings(hybridAppSettings: string): HybridAppSettings {
    return JSON.parse(hybridAppSettings) as HybridAppSettings;
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

/*
 * Changes NewDot sign-in state
 */
function setNewDotSignInState(newDotSignInState: ValueOf<typeof CONST.HYBRID_APP_SIGN_IN_STATE>) {
    // This value is only relevant for HybridApp, so we can skip it in other environments.
    if (!CONFIG.IS_HYBRID_APP) {
        return;
    }
    Onyx.merge(ONYXKEYS.HYBRID_APP, {newDotSignInState});
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
        return;
    }

    Onyx.merge(ONYXKEYS.HYBRID_APP, {
        readyToShowAuthScreens: false,
        newDotSignInState: CONST.HYBRID_APP_SIGN_IN_STATE.NOT_STARTED,
        useNewDotSignInPage: true,
    });
}

/*
 * Updates Onyx state after start of React Native runtime based on initial `useNewDotSignInPage` value
 */
function prepareHybridAppAfterTransitionToNewDot(hybridApp: HybridApp) {
    if (hybridApp?.useNewDotSignInPage) {
        return Onyx.merge(ONYXKEYS.HYBRID_APP, {
            ...hybridApp,
            readyToShowAuthScreens: !(hybridApp?.useNewDotSignInPage ?? false),
            newDotSignInState: CONST.HYBRID_APP_SIGN_IN_STATE.NOT_STARTED,
        });
    }

    // When we transition with useNewDotSignInPage === false, it means that we're already authenticated on NewDot side.
    return Onyx.merge(ONYXKEYS.HYBRID_APP, {
        ...hybridApp,
        readyToShowAuthScreens: true,
    });
}

export {parseHybridAppSettings, setReadyToShowAuthScreens, setNewDotSignInState, resetSignInFlow, prepareHybridAppAfterTransitionToNewDot, setUseNewDotSignInPage, setClosingReactNativeApp};
