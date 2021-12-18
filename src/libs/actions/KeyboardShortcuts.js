import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isShortcutsModelOpen;
Onyx.connect({
    key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN,
    callback: flag => isShortcutsModelOpen = flag,
});

/**
 * Set keyboard shortcuts flag to show modal
 */
function showKeyboardShortcutModal() {
    if (isShortcutsModelOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN, true);
}

/**
 * Unset keyboard shortcuts flag to hide modal
 */
function hideKeyboardShortcutModal() {
    Onyx.set(ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN, false);
}

export {
    showKeyboardShortcutModal,
    hideKeyboardShortcutModal,
};
