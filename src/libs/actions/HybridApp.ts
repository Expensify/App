import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

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

export {setOldDotSignInError, setIsSigningIn, setReadyToShowAuthScreens, setReadyToSwitchToClassicExperience, setShouldResetSigningInLogic, setUseNewDotSignInPage, setLoggedOutFromOldDot};
