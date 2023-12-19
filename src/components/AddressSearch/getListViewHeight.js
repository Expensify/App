/**
 * get the height of list view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @param {Number} locationErrorCode the error code for location
 * @returns {Object} styles for list view.
 */
function getListViewHeight(windowHeight, locationErrorCode) {
    const restHeight = locationErrorCode ? 257 + 64 : 257;
    return {
        overflow: 'auto',
        maxHeight: windowHeight - restHeight,
    };
}

export default getListViewHeight;
