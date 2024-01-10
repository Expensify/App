/**
 * get the height of Form view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @param {Boolean} isOffline Whether device is
 * @returns {Object} styles for the Form height.
 */
function getAddressFormHeight(windowHeight, isOffline) {
    return {
        maxHeight: windowHeight - 175 - (isOffline ? 26 : 0),
        height: windowHeight - 175 - (isOffline ? 26 : 0),
    };
}

export default getAddressFormHeight;
