import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsSigningIn(isSigningIn: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {isSigningIn});
}

function setReadyToShowAuthScreens(readyToShowAuthScreens: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {readyToShowAuthScreens});
}

function setReadyToSwitchToClassicExperience(readyToSwitchToClassicExperience: boolean) {
    Onyx.merge(ONYXKEYS.HYBRID_APP, {readyToSwitchToClassicExperience});
}

export {setIsSigningIn, setReadyToShowAuthScreens, setReadyToSwitchToClassicExperience};
