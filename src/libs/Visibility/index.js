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
 * @return {Function} removes the listener
 */
function onVisibilityChange(callback) {
    // Deliberately strip callback argument to be consistent across implementations
    const subscription = AppState.addEventListener('change', () => callback());

    return () => subscription.remove();
}

export default {
    isVisible,
    onVisibilityChange,
};
