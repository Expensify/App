import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.UPDATE_AVAILABLE, true);
}

function setIsAppInBeta(isBeta: boolean) {
    Onyx.set(ONYXKEYS.IS_BETA, isBeta);
}

function triggerUpgradeRequired() {
    Onyx.set(ONYXKEYS.UPGRADE_REQUIRED, true);
}

export {triggerUpdateAvailable, setIsAppInBeta, triggerUpgradeRequired};
