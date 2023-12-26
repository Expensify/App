/**
 * get the height of Form view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windowsgit l
 * @returns {Object} styles for the Form height.
 */
function getAddressFormHeight(windowHeight) {
    return {
        maxHeight: windowHeight - 65,
    };
}

export default getAddressFormHeight;
