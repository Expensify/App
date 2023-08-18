import CONST from '../../CONST';
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
        OnyxUpdates.saveUpdateIDs(
            {
                updateType: CONST.ONYX_UPDATE_TYPES.HTTPS,
                data: {
                    request,
                    responseData,
                },
            },
            Number(responseData.lastUpdateID || 0),
            Number(responseData.previousUpdateID || 0),
        );

        return responseData;
    });
}

export default SaveResponseInOnyx;
