/**
 * Tells Search which transactions a successful user write changed on the server.
 *
 * A request that rolls a transaction back in its failureData is a mutation of that transaction. Reads that also
 * write transactions, like OpenReport seeding one from a Search row, have nothing to roll back, so they never count.
 */
import type {Middleware} from '@libs/Request';

import notifySearchOfTransactionWrites from '@userActions/notifySearchOfTransactionWrites';

import CONST from '@src/CONST';

const flagSearchTransactionWrites: Middleware = (requestResponse, request, isFromSequentialQueue) =>
    requestResponse.then((response) => {
        if (isFromSequentialQueue && response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
            notifySearchOfTransactionWrites(request.failureData);
        }
        return response;
    });

export default flagSearchTransactionWrites;
