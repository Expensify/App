/**
 * Focus the text input with a slight delay to make sure modals are closed first.
 * Since in react-native-modal `onModalHide` is called before the modal is actually hidden.
 * It results in the keyboard being dismissed right away on both iOS and Android.
 * See this discussion for more details: https://github.com/Expensify/App/issues/18300
 *
 * @param {Object} inputRef
 * @param {Number} animationLength you must use your best guess as to what a good animationLength is. It can't be too short, or the animation won't be finished. It can't be too long or
 *      the user will notice that it feels sluggish
 */
const focusTextInputAfterAnimation = (inputRef, animationLength = 0) => {
    setTimeout(() => {
        inputRef.focus();
    }, animationLength);
};

export default focusTextInputAfterAnimation;
