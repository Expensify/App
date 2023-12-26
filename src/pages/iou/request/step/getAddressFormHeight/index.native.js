/**
 * get the height of Form view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @returns {Object} styles for the Form height.
 */
function getAddressFormHeight(windowHeight) {
    return {
        maxHeight: windowHeight - 175,
    };
}

export default getAddressFormHeight;
