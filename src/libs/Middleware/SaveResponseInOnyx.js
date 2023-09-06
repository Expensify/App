import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as MemoryOnlyKeys from '../actions/MemoryOnlyKeys/MemoryOnlyKeys';
import * as OnyxUpdates from '../actions/OnyxUpdates';

// If we're executing any of these requests, we don't need to trigger our OnyxUpdates flow to update the current data even if our current value is out of
// date because all these requests are updating the app to the most current state.
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

        const lastUpdateIDFromServer = Number(responseData.lastUpdateID || 0);
        const previousUpdateIDFromServer = Number(responseData.previousUpdateID || 0);

        // If the client doesn't need to be updated, then trigger update onyx like normal
        if (_.includes(requestsToIgnoreLastUpdateID, request.command) || !OnyxUpdates.doesClientNeedToBeUpdated(previousUpdateIDFromServer)) {
            OnyxUpdates.saveLastUpdateID(lastUpdateIDFromServer);

            // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
            // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
            const updateHandler = request.data.apiRequestType === CONST.API_REQUEST_TYPE.WRITE ? QueuedOnyxUpdates.queueOnyxUpdates : Onyx.update;

            // First apply any onyx data updates that are being sent back from the API. We wait for this to complete and then
            // apply successData or failureData. This ensures that we do not update any pending, loading, or other UI states contained
            // in successData/failureData until after the component has received and API data.
            const onyxDataUpdatePromise = responseData.onyxData ? updateHandler(responseData.onyxData) : Promise.resolve();

            return onyxDataUpdatePromise
                .then(() => {
                    // Handle the request's success/failure data (client-side data)
                    if (response.jsonCode === 200 && request.successData) {
                        return updateHandler(request.successData);
                    }
                    if (response.jsonCode !== 200 && request.failureData) {
                        return updateHandler(request.failureData);
                    }
                    return Promise.resolve();
                })
                .then(() => {
                    return response;
                });
        }

        // This triggers code in OnyxUpdateManager which will resolve the gap of updates
        // Always use set() here so that the updateParams are never merged and always unique to the request that came in
        Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, {
            lastUpdateIDFromServer,
            previousUpdateIDFromServer,
            incomingOnyxUpdates: responseData.onyxData,
        });

        // Ensure the queue is paused while the client resolves the gap in onyx updates so that updates are guaranteed to happen in a specific order.
        return Promise.resolve({
            ...responseData,
            shouldPauseQueue: true,
        });
    });
}

export default SaveResponseInOnyx;
