import {AppState} from 'react-native';

/**
 * Detects whether the app is visible or not.
 *
 * @returns {Boolean}
 */
function isVisible() {
    return document.visibilityState === 'visible';
}

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
