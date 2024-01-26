// Mobile apps do not require this check for visibility as
// they do not use the Notification lib.
import {AppState} from 'react-native';
import type {HasFocus, IsVisible, OnVisibilityChange} from './types';

const isVisible: IsVisible = () => AppState.currentState === 'active';

const hasFocus: HasFocus = () => true;

/**
 * Adds event listener for changes in visibility state
 */
const onVisibilityChange: OnVisibilityChange = (callback) => {
    // Deliberately strip callback argument to be consistent across implementations
    const subscription = AppState.addEventListener('change', () => callback());

    return () => subscription.remove();
};

export default {
    isVisible,
    hasFocus,
    onVisibilityChange,
};
