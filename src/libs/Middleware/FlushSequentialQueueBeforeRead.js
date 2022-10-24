import * as SequentialQueue from '../Network/SequentialQueue';
import CONST from '../../CONST';

/**
 * ... TODO
 *
 * @param {Promise} response
 * @returns {Promise}
 */
function FlushSequentialQueueBeforeRead(response, request) {
    if (request.apiRequestType !== CONST.API_REQUEST_TYPE.READ) {
        return response;
    }
    return SequentialQueue.flush().then((() => response));
}

export default FlushSequentialQueueBeforeRead;
