import CONST from '@src/CONST';

// Calculates the height of a modal in landscape mode based on the window height and keyboard state.
function calculateModalHeightInLandscapeMode(windowHeight: number, topSafeAreaInset: number, keyboardActiveHeight: number) {
    const availableWindowHeight = windowHeight - topSafeAreaInset;

    if (keyboardActiveHeight > 0) {
        return availableWindowHeight - keyboardActiveHeight;
    }

    return windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE;
}

export default calculateModalHeightInLandscapeMode;
