// Mobile apps do not require this check for visibility as
// they do not use the Notification lib.

import {AppState} from 'react-native';

/**
 * @return {Boolean}
 */
const isVisible = () => AppState.currentState === 'active';

/**
 * Adds event listener for changes in visibility state
 *
 * @param {Function} callback
 *
 * @return {Object} To have .remove() invoked to remove listener
 */
function addEventListener(callback) {
    return AppState.addEventListener('change', callback);
}

export default {
    isVisible,
    addEventListener,
};
