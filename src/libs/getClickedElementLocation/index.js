/**
 * Returns the position of the clicked element
 *
 * @param {Object} nativeEvent
 * @returns {Object}
 */
function getClickedElementLocation(nativeEvent) {
    return nativeEvent.target.getBoundingClientRect();
}

export default getClickedElementLocation;
