/**
 * Call the callback after screen transiton has ended
 *
 * @param {Object} navigation Screen navigation prop
 * @param {Function} callback Method to call
 * @returns {Function}
 */
function onScreenTransitionEnd(navigation, callback) {
    return navigation.addListener('transitionEnd', callback);
}

export default onScreenTransitionEnd;
