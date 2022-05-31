import CONST from '../../CONST';
import * as NetInfo from '../NetInfo';

/**
 * @param {Promise} response
 * @returns {Promise}
 */
function RecheckConnection(response) {
    return response
        .catch((error) => {
            if (error.name !== CONST.ERROR.REQUEST_CANCELLED) {
                // Because we ran into an error we assume we might be offline and do a "connection" health test
                NetInfo.recheckInternetConnection();
            }

            throw error;
        });
}

export default RecheckConnection;
