/**
 * Returns the position of the clicked element
 *
 * @param {Object} nativeEvent
 * @returns {Promise}
 */
function getClickedElementLocation(nativeEvent) {
    return Promise.resolve(nativeEvent.target.getBoundingClientRect());
}

export default getClickedElementLocation;
