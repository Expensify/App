/**
 * get the height of list view in GooglePlacesAutocomplete.
 * @param {Number} windowHeight the height of windows
 * @returns {Object} styles for list view.
 */
function getListViewHeight(windowHeight) {
    return {
        overflow: 'auto',
        maxHeight: windowHeight - 230,
    };
}

export default getListViewHeight;
