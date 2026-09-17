/**
 * On Android the discard modal is a separate Dialog window and the system restores focus and the IME
 * itself once it dismisses, so `isFocused()` returning true is an accurate report of a correct state
 * and the early-return is the right behavior. Forcing a re-focus there resolves to
 * `ReactEditText.requestFocusProgrammatically()`, whose `showSoftKeyboard()` is gated behind
 * `isInTouchMode` and is skipped on the hardware-back path, which drops the keyboard entirely.
 * On web `requestKeyboardForFocusedComposer` is already a NOOP.
 */
export default function shouldForceKeyboardIfAlreadyFocused(): boolean {
    return false;
}
