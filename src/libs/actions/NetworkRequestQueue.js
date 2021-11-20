import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function clearPersistedRequests() {
    Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, []);
}

function saveRetryableRequests(retryableRequests) {
    Onyx.merge(ONYXKEYS.NETWORK_REQUEST_QUEUE, retryableRequests);
}

export {
    clearPersistedRequests,
    saveRetryableRequests,
};
