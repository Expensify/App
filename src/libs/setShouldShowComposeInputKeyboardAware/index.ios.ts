import setShouldShowComposeInputKeyboardAwareBuilder from './setShouldShowComposeInputKeyboardAwareBuilder';

// On iOS, there is a visible delay in displaying input after the keyboard has been closed with the `keyboardDidHide` event
// Because of that - on iOS we can use `keyboardWillHide` that is not available on android
export default setShouldShowComposeInputKeyboardAwareBuilder('keyboardWillHide');
