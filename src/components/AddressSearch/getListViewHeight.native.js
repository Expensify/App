/**
 * get the height of list view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @param {Number} locationErrorCode the error code for location
 * @param {Boolean} isOffline the value to show if the network is offline or not
 * @returns {Object} styles for list view.
 */
function getListViewHeight(windowHeight, locationErrorCode, isOffline) {
    let restHeight = locationErrorCode ? 330 + 64 : 330;
    if (isOffline) {
        restHeight += 50;
    }

    return {
        overflow: 'hidden',
        maxHeight: windowHeight - restHeight,
    };
}

export default getListViewHeight;
