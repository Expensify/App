import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.UPDATE_AVAILABLE, true);
}

/**
 * @param {Boolean} isBeta
 */
function setIsAppInBeta(isBeta) {
    Onyx.set(ONYXKEYS.IS_BETA, isBeta);
}

export {
    triggerUpdateAvailable,
    setIsAppInBeta,
};
