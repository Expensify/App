/**
 * get the height of Form view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @param {Boolean} isOffline the status of network
 * @returns {Object} styles for the Form height.
 */
function getAddressFormHeight(windowHeight, isOffline) {
    return {
        height: windowHeight - (isOffline ? 127 : 100),
    };
}

export default getAddressFormHeight;
