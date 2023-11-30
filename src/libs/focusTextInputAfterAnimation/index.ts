import FocusTextInputAfterAnimation from './types';

/**
 * This library is a no-op for all platforms except for Android and iOS and will immediately focus the given input without any delays.
 */
const focusTextInputAfterAnimation: FocusTextInputAfterAnimation = (inputRef) => {
    inputRef.focus();
};

export default focusTextInputAfterAnimation;
