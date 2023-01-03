/**
 * This library is a no-op for all platforms except for Android and will immediately focus the given input without any delays. This is important for native iOS clients because
 * text inputs can only be focused from user interactions and wrapping the focus() inside a setTimeout breaks that use case since it's no longer triggered from a user interaction.
 *
 * @param {Object} inputRef
 */
const focusTextInputAfterAnimation = (inputRef) => {
    inputRef.focus();
};

export default focusTextInputAfterAnimation;
