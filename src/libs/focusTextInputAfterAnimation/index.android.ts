import FocusTextInputAfterAnimation from './types';

/**
 * Initially this file is intended for native ios but use index.native.js filename and affects android.
 *
 * Initial comment for this file is:
 * "Focus the text input with a slight delay to make sure modals are closed first.
 * Since in react-native-modal `onModalHide` is called before the modal is actually hidden.
 * It results in the keyboard being dismissed right away on both iOS and Android.
 * See this discussion for more details: https://github.com/Expensify/App/issues/18300"
 *
 * But the bug already fixed, without using setTimeout for IOS the focus seems to work properly.
 * Instead there is new IOS bug of text input content doesn't scroll to bottom if using setTimeout,
 * also there is an android keyboard doesn't show up bug when text input is focused and
 * the use of setTimeout will make the keyboard show up properly.
 *
 * @param animationLength you must use your best guess as to what a good animationLength is. It can't be too short, or the animation won't be finished. It can't be too long or
 *      the user will notice that it feels sluggish
 */
const focusTextInputAfterAnimation: FocusTextInputAfterAnimation = (inputRef, animationLength = 0) => {
    setTimeout(() => {
        inputRef.focus();
    }, animationLength);
};

export default focusTextInputAfterAnimation;
