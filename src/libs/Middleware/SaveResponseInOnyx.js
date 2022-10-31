import Onyx from 'react-native-onyx';
import _ from 'underscore';

/**
 * @param {Promise} response
 * @param {Object} request
 * @returns {Promise}
 */
function SaveResponseInOnyx(response, request) {
    return response
        .then((responseData) => {
            const onyxUpdates = [];

            console.log(">>>> SaveResponseInOnyx for", request.command);

            // Make sure we have response data (i.e. response isn't a promise being passed down to us by a failed retry request and responseData undefined)
            if (!responseData) {
                return;
            }

            // Handle the request's success/failure data (client-side data)
            if (responseData.jsonCode === 200 && request.successData) {
                onyxUpdates.push(...request.successData);
            } else if (responseData.jsonCode !== 200 && request.failureData) {
                onyxUpdates.push(...request.failureData);
            }

            // Add any onyx updates that are being sent back from the API
            if (responseData.onyxData) {
                onyxUpdates.push(...responseData.onyxData);
            }

            if (!_.isEmpty(onyxUpdates)) {
                Onyx.update(onyxUpdates);
            }

            return responseData;
        });
}

export default SaveResponseInOnyx;
