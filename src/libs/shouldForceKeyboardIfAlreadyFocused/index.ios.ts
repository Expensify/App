/**
 * On iOS, flipping a TextInput to `editable={false}` (as the discard-changes modal does) makes the
 * system resign the IME while RN's JS-side `isFocused()` still reports true. `focusComposerWithDelay`
 * then early-returns on its already-focused guard and the keyboard never comes back, so we opt into
 * `forceKeyboardIfAlreadyFocused` to re-request it via KeyboardController.
 */
export default function shouldForceKeyboardIfAlreadyFocused(): boolean {
    return true;
}
