import CONST from '@src/CONST';

/**
 * On Android native, use `SUBMIT_ONLY` to call `onSubmit` immediately without any
 * keyboard dismissal. Navigation handles keyboard cleanup automatically on Android.
 * This avoids the floating Save button caused by `KeyboardAvoidingView` removing its
 * keyboard offset before the screen finishes unmounting.
 */
const KEYBOARD_SUBMIT_BEHAVIOR = CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY;

export default KEYBOARD_SUBMIT_BEHAVIOR;
