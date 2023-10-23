import CONST from '../../CONST';
import NetworkConnection from '../NetworkConnection';
import Middleware from './types';

/**
 * @returns cancel timer
 */
function startRecheckTimeoutTimer(): () => void {
    // If request is still in processing after this time, we might be offline
    const timerID = setTimeout(NetworkConnection.recheckNetworkConnection, CONST.NETWORK.MAX_PENDING_TIME_MS);
    return () => clearTimeout(timerID);
}

const RecheckConnection: Middleware = (response) => {
    // When the request goes past a certain amount of time we trigger a re-check of the connection
    const cancelRequestTimeoutTimer = startRecheckTimeoutTimer();
    return response
        .catch((error) => {
            if (error.name !== CONST.ERROR.REQUEST_CANCELLED) {
                // Because we ran into an error we assume we might be offline and do a "connection" health test
                NetworkConnection.recheckNetworkConnection();
            }

            throw error;
        })
        .finally(cancelRequestTimeoutTimer);
};

export default RecheckConnection;
