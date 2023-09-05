import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as MemoryOnlyKeys from '../actions/MemoryOnlyKeys/MemoryOnlyKeys';
import * as OnyxUpdates from '../actions/OnyxUpdates';

// If we're executing any of these requests, we don't need to trigger our OnyxUpdates flow to update the current data even if our current value is out of date.
const requestsToIgnoreLastUpdateID = ['OpenApp', 'ReconnectApp', 'GetMissingOnyxMessages'];

/**
 * @param {Promise} response
 * @param {Object} request
 * @returns {Promise}
 */
function SaveResponseInOnyx(response, request) {
    return response.then((responseData) => {
        // Make sure we have response data (i.e. response isn't a promise being passed down to us by a failed retry request and responseData undefined)
        if (!responseData) {
            return;
        }
        const onyxUpdates = responseData.onyxData;

        // Sometimes we call requests that are successfull but they don't have any response or any success/failure data to set. Let's return early since
        // we don't need to store anything here.
        if (!onyxUpdates && !request.successData && !request.failureData) {
            return Promise.resolve(responseData);
        }

        // If there is an OnyxUpdate for using memory only keys, enable them
        _.find(onyxUpdates, ({key, value}) => {
            if (key !== ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS || !value) {
                return false;
            }

            MemoryOnlyKeys.enable();
            return true;
        });

        const responseToApply = {
            type: CONST.ONYX_UPDATE_TYPES.HTTPS,
            lastUpdateID: Number(responseData.lastUpdateID || 0),
            data: {
                request,
                responseData,
            },
        };

        if (_.includes(requestsToIgnoreLastUpdateID, request.command) || !OnyxUpdates.needsToUpdateClient(Number(responseData.previousUpdateID || 0))) {
            return OnyxUpdates.apply(responseToApply);
        }

        // Save the update IDs to Onyx so they can be used to fetch incremental updates if the client gets out of sync from the server
        OnyxUpdates.saveUpdateInformation(responseToApply, Number(responseData.lastUpdateID || 0), Number(responseData.previousUpdateID || 0));

        // We'll add the pauseQueue property here to guarantee we're pausing the queue before we execute the next request. If we do it only on the trigger in
        // OnyxUpdateManager, then we might have already started another request while we wait.
        return Promise.resolve({
            ...responseData,
            pauseQueue: true,
        });
    });
}

export default SaveResponseInOnyx;
