import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Boolean} isLoadingAfterReconnect
 */
function setIsLoadingAfterReconnect(isLoadingAfterReconnect) {
    Onyx.set(ONYXKEYS.IS_LOADING_AFTER_RECONNECT, isLoadingAfterReconnect);
}

/**
 * @param {Boolean} isOffline
 */
function setIsOffline(isOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
}

export {
    setIsLoadingAfterReconnect,
    setIsOffline,
};
