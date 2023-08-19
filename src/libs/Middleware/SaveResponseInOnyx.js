import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as MemoryOnlyKeys from '../actions/MemoryOnlyKeys/MemoryOnlyKeys';
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

        // The data for this response comes in two different formats:
        // 1. Original format - this is what was sent before the RELIABLE_UPDATES project and will go away once RELIABLE_UPDATES is fully complete
        //     - The data is an array of objects, where each object is an onyx update
        //       Example: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]
        // 1. Reliable updates format - this is what was sent with the RELIABLE_UPDATES project and will be the format from now on
        //     - The data is an object, containing updateIDs from the server and an array of onyx updates (this array is the same format as the original format above)
        //       Example: {lastUpdateID: 1, previousUpdateID: 0, onyxData: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]}
        //       NOTE: This is slightly different than the format of the pusher event data, where pusher has "updates" and HTTPS responses have "onyxData" (long story)

        // Supports both the old format and the new format
        const onyxUpdates = _.isArray(responseData) ? responseData : responseData.onyxData;
        // If there is an OnyxUpdate for using memory only keys, enable them
        _.find(onyxUpdates, ({key, value}) => {
            if (key !== ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS || !value) {
                return false;
            }

            MemoryOnlyKeys.enable();
            return true;
        });

        // Save the update IDs to Onyx so they can be used to fetch incremental updates if the client gets out of sync from the server
        OnyxUpdates.saveUpdateInformation(
            {
                type: CONST.ONYX_UPDATE_TYPES.HTTPS,
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
