import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type HybridAppSettings from './types';

function parseHybridAppSettings(hybridAppSettings: string): HybridAppSettings {
    return JSON.parse(hybridAppSettings) as HybridAppSettings;
}

function setIsSigningIn(isSigningIn: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {isSigningIn});
}

function setOldDotSignInError(oldDotSignInError: string | null) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {oldDotSignInError});
}

function setReadyToShowAuthScreens(readyToShowAuthScreens: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {readyToShowAuthScreens});
}

function setReadyToSwitchToClassicExperience(readyToSwitchToClassicExperience: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {readyToSwitchToClassicExperience});
}

function setShouldResetSigningInLogic(shouldResetSigningInLogic: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {shouldResetSigningInLogic});
}

function setUseNewDotSignInPage(useNewDotSignInPage: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {useNewDotSignInPage});
}

function setLoggedOutFromOldDot(loggedOutFromOldDot: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {loggedOutFromOldDot});
}

function setNewDotSignInState(newDotSignInState: ValueOf<typeof CONST.HYBRID_APP_SIGN_IN_STATE>) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {newDotSignInState});
}

function setOldDotSignInState(oldDotSignInState: ValueOf<typeof CONST.HYBRID_APP_SIGN_IN_STATE>) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {oldDotSignInState});
}

export {
    parseHybridAppSettings,
    setOldDotSignInError,
    setIsSigningIn,
    setReadyToShowAuthScreens,
    setReadyToSwitchToClassicExperience,
    setShouldResetSigningInLogic,
    setUseNewDotSignInPage,
    setLoggedOutFromOldDot,
    setNewDotSignInState,
    setOldDotSignInState,
};
