import CONST from '@src/CONST';

/**
 * On web and iOS native, use `SUBMIT_AND_DISMISS` to call `onSubmit` immediately
 * while dismissing the keyboard in parallel via `dismissKeyboardAndExecute`.
 * This avoids the delay caused by `dismiss().then(onSubmit)` on iOS native,
 * and the hanging button issue on Android mobile web Chrome.
 */
const KEYBOARD_SUBMIT_BEHAVIOR = CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_AND_DISMISS;

export default KEYBOARD_SUBMIT_BEHAVIOR;
