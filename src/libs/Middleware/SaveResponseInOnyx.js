import Onyx from 'react-native-onyx';

/**
 * @param {Promise} response
 * @param {Object} request
 * @returns {Promise}
 */
function SaveResponseInOnyx(response, request) {
    return response
        .then((responseData) => {
            // We'll only save the onyxData, successData and failureData for the refactored commands
            const data = [];
            if (responseData.jsonCode === 200) {
                if (request.successData) {
                    data.push(...request.successData);
                }
            } else if (request.failureData) {
                data.push(...request.failureData);
            }
            if (responseData.onyxData) {
                data.push(...responseData.onyxData);
            }
            Onyx.update(data);
            return responseData;
        });
}

export default SaveResponseInOnyx;
