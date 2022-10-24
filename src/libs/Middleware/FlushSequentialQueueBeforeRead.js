import * as SequentialQueue from '../Network/SequentialQueue';

/**
 * ... TODO
 *
 * @param {Promise} response
 * @returns {Promise}
 */
function FlushSequentialQueueBeforeRead(response, request) {
    if (request.apiRequestType !== 'read') {
        return response;
    }
    return SequentialQueue.flush().then((() => response));
}

export default FlushSequentialQueueBeforeRead;
