// Mobile apps do not require this check for visibility as
// they do not use the Notification lib.

import {AppState} from 'react-native';

function isVisible() {
    return AppState.currentState === 'active';
}

function hasFocus() {
    return true;
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
