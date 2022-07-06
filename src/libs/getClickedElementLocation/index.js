/**
 * Returns the position of the clicked element
 *
 * @param {Object} ref
 * @returns {Promise|Object}
 */
function getClickedElementLocation(ref) {
    const clientRect = ref.getBoundingClientRect();
    return {
        then: resolve => resolve(clientRect),
    };
}

export default getClickedElementLocation;
