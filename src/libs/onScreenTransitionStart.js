/**
 * Call the callback after screen transition has started
 *
 * @param {Object} navigation Screen navigation prop
 * @param {Function} callback Method to call
 * @returns {Function}
 */
function onScreenTransitionStart(navigation, callback) {
    return navigation.addListener('transitionStart', callback);
}

export default onScreenTransitionStart;
