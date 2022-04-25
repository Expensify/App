/**
 * Returns the position of the clicked element
 *
 * @param {Object} nativeEvent
 * @returns {Object}
 */
function getClickedElementLocation(nativeEvent) {
    return {
        bottom: nativeEvent.absolutePosition.y + nativeEvent.absolutePosition.height,
        left: nativeEvent.absolutePosition.x,
    };
}

export default getClickedElementLocation;
