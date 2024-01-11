/**
 * get the height of Form view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windowsgit l
 * @param {Boolean} isOffline Whether network is offline
 * @param {Boolean} isSmallScreenWidth Whether network is offline
 * @returns {Object} styles for the Form height.
 */
function getAddressFormHeight(windowHeight, isOffline, isSmallScreenWidth) {
    return {
        maxHeight: windowHeight - 65 - (isOffline && isSmallScreenWidth ? 26 : 0),
        overflow: 'hidden',
    };
}

export default getAddressFormHeight;
