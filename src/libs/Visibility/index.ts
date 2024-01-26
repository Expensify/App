import {AppState} from 'react-native';
import type {HasFocus, IsVisible, OnVisibilityChange} from './types';

/**
 * Detects whether the app is visible or not.
 */
const isVisible: IsVisible = () => document.visibilityState === 'visible';

/**
 * Whether the app is focused.
 */
const hasFocus: HasFocus = () => document.hasFocus();

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
