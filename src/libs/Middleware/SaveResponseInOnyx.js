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
            const data = [];

            // Make sure we have a response (i.e. this isn't a promise being passed down to us by a failed retry request and responseData is undefined)
            if (responseData) {
                // Handle the request's success/failure data (client-side data)
                if (responseData.jsonCode === 200 && request.successData) {
                    data.push(...request.successData);
                } else if (request.failureData) {
                    data.push(...request.failureData);
                }

                // Add any onyx updates that are being sent back from the API
                if (responseData.onyxData) {
                    data.push(...responseData.onyxData);
                }

                if (!_.isEmpty(data)) {
                    Onyx.update(data);
                }
            }

            return responseData;
        });
}

export default SaveResponseInOnyx;
