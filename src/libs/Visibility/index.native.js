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
 * @return {Function} removes the listener
 */
function onVisibilityChange(callback) {
    // Deliberately strip callback argument to be consistent across implementations
    return AppState.addEventListener('change', () => callback()).remove;
}

export default {
    isVisible,
    onVisibilityChange,
};
