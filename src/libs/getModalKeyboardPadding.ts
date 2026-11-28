type ModalKeyboardPaddingParams = {
    /** Keyboard height reported by react-native-keyboard-controller, measured from the bottom of the screen */
    keyboardHeight: number;

    /** Height of the safe-area frame (useWindowDimensions) */
    frameHeight: number;

    /** Height of the window the modal is laid out in (Dimensions.get('window')) */
    windowHeight: number;

    safeAreaPaddingTop: number;
    safeAreaPaddingBottom: number;
};

/**
 * Bottom padding that keeps a bottom-docked modal sheet above the keyboard.
 * Without edge-to-edge (HybridApp) the modal stops above the navigation bar while the keyboard height counts from the screen bottom, so that overlap is not padded again.
 */
function getModalKeyboardPadding({keyboardHeight, frameHeight, windowHeight, safeAreaPaddingTop, safeAreaPaddingBottom}: ModalKeyboardPaddingParams): number {
    'worklet';

    const modalBottomInset = Math.min(Math.max(frameHeight - windowHeight - safeAreaPaddingTop, 0), safeAreaPaddingBottom);
    return Math.max(safeAreaPaddingBottom, keyboardHeight - modalBottomInset);
}

export default getModalKeyboardPadding;
export type {ModalKeyboardPaddingParams};
