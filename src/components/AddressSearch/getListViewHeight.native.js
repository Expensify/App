/**
 * get the height of list view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @param {Boolean} isOffline the value to show if the network is offline or not
 * @returns {Object} styles for list view.
 */
function getListViewHeight(windowHeight, isOffline) {
    return {
        overflow: 'hidden',
        maxHeight: isOffline ? windowHeight - 350 : windowHeight - 300,
    };
}

export default getListViewHeight;
