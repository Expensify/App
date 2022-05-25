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
            // We'll only save the onyxData, successData and failureData for the refactored commands
            if (_.has(responseData, 'onyxData')) {
                let data;
                if (responseData.jsonCode === 200) {
                    data = [
                        ...request.successData,
                        ...responseData.onyxData,
                    ];
                } else {
                    data = [
                        ...request.failureData,
                        ...responseData.onyxData,
                    ];
                }
                Onyx.update(data);
            }
            return responseData;
        });
}

export default SaveResponseInOnyx;
