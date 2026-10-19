/**
 * Reclaiming the header's space for the keyboard is a mobile web only treatment. Native keeps its header in landscape:
 * the OS resizes the app around the keyboard and KeyboardAvoidingView handles the reveal, so nothing has to yield.
 */
function useShouldHideHeaderForKeyboard(): boolean {
    return false;
}

export default useShouldHideHeaderForKeyboard;
