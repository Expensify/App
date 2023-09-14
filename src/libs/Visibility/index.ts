import {AppState} from 'react-native';

/**
 * Detects whether the app is visible or not.
 */
function isVisible() {
    return document.visibilityState === 'visible';
}

/**
 * Whether the app is focused.
 */
function hasFocus() {
    return document.hasFocus();
}

/**
 * Adds event listener for changes in visibility state
 */
function onVisibilityChange(callback: () => void) {
    // Deliberately strip callback argument to be consistent across implementations
    const subscription = AppState.addEventListener('change', () => callback());

    return () => subscription.remove();
}

export default {
    isVisible,
    hasFocus,
    onVisibilityChange,
};
