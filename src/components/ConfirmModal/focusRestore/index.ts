import type {FocusRestoreModule} from './types';

const focusRestore: FocusRestoreModule = {
    getInitialFocusTarget: () => false,
    restoreCapturedAnchorFocus: () => {},
    shouldTryKeyboardInitialFocus: () => false,
    isWebPlatform: () => false,
};

const {getInitialFocusTarget, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus, isWebPlatform} = focusRestore;

export {getInitialFocusTarget, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus, isWebPlatform};
