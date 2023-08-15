import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as QueuedOnyxUpdates from '../actions/QueuedOnyxUpdates';
import * as OnyxUpdates from '../actions/OnyxUpdates';

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

        // Save the update IDs to Onyx so they can be used to fetch incremental updates if the client gets out of sync from the server
        OnyxUpdates.saveUpdateIDs(Number(responseData.lastUpdateID || 0), Number(responseData.previousUpdateID || 0));

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
                if (responseData.jsonCode === 200 && request.successData) {
                    return updateHandler(request.successData);
                }
                if (responseData.jsonCode !== 200 && request.failureData) {
                    return updateHandler(request.failureData);
                }
                return Promise.resolve();
            })
            .then(() => responseData);
    });
}

export default SaveResponseInOnyx;
