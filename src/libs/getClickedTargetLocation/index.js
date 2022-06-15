/**
 * Returns the Bounding Rectangle for the passed native event's target.
 *
 * @param {Object} target
 * @returns {Object}
 */
function getClickedTargetLocation(target) {
    return target.getBoundingClientRect();
}

export default getClickedTargetLocation;
