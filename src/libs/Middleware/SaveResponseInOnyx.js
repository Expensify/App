import Onyx from 'react-native-onyx';

/**
 * @param {Promise} response
 * @param {Object} request
 * @returns {Promise}
 */
function SaveResponseInOnyx(response, request) {
    return response
        .then((responseObject) => {
            let data;
            if (responseObject.jsonCode === 200) {
                data = [
                    ...request.successData,
                    ...responseObject.onyxData,
                ];
            } else {
                data = [
                    ...request.failureData,
                    ...responseObject.onyxData,
                ];
            }
            Onyx.update(data);
        });
}

export default SaveResponseInOnyx;
