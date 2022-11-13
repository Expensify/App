import Onyx from 'react-native-onyx';

/**
 * @param {Promise} response
 * @param {Object} request
 * @returns {Promise}
 */
function SaveResponseInOnyx(response, request) {
    return response
        .then((responseData) => {
            // Make sure we have response data (i.e. response isn't a promise being passed down to us by a failed retry request and responseData undefined)
            if (!responseData) {
                return;
            }

            // First apply any onyx data updates that are being sent back from the API. We wait for this to complete and then
            // apply successData or failureData. This ensures that we do not update any pending, loading, or other UI states contained
            // in successData/failureData until after the component has received and API data.
            const onyxDataUpdatePromise = responseData.onyxData
                ? Onyx.update(responseData.onyxData)
                : Promise.resolve();

            onyxDataUpdatePromise.then(() => {
                // Handle the request's success/failure data (client-side data)
                if (responseData.jsonCode === 200 && request.successData) {
                    Onyx.update(request.successData);
                } else if (responseData.jsonCode !== 200 && request.failureData) {
                    Onyx.update(request.failureData);
                }
            });

            return responseData;
        });
}

export default SaveResponseInOnyx;
