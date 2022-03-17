/**
 * Returns the position of the clicked element
 *
 * @param {Object} nativeEvent
 * @returns {Object}
 */
function getClickedElementLocation(nativeEvent) {
    return {
        bottom: nativeEvent.pageY - nativeEvent.locationY,
        left: nativeEvent.pageX - nativeEvent.locationX,
    };
}

export default getClickedElementLocation;
