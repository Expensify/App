import CONST from '../../CONST';
import * as NetworkConnection from '../NetworkConnection';

/**
 * @returns {Function} cancel timer
 */
function startRecheckTimeoutTimer() {
    // If request is still in processing after this time, we might be offline
    const timerID = setTimeout(NetworkConnection.recheckNetworkConnection, CONST.NETWORK.MAX_PENDING_TIME_MS);
    return () => clearTimeout(timerID);
}

export default (response) => {
    // When the request goes past a certain amount of time we trigger a re-check of the connection
    const cancelRequestTimeoutTimer = startRecheckTimeoutTimer();
    return response
        .catch((error) => {
            // Because we ran into an error we assume we might be offline and do a "connection" health test
            NetworkConnection.recheckNetworkConnection();
            throw error;
        })
        .finally(() => cancelRequestTimeoutTimer());
};
