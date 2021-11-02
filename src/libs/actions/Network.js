import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Boolean} isLoadingAfterReconnect
 */
function setIsLoadingAfterReconnect(isLoadingAfterReconnect) {
    Onyx.set(ONYXKEYS.IS_LOADING_AFTER_RECONNECT, isLoadingAfterReconnect);
}

/**
 * @param {Boolean} isCurrentlyOffline
 */
function setIsOffline(isCurrentlyOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: isCurrentlyOffline});
}

export {
    setIsLoadingAfterReconnect,
    setIsOffline,
};
