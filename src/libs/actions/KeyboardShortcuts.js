import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isShortcutsModalOpen;
Onyx.connect({
    key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN,
    callback: flag => isShortcutsModalOpen = flag,
});

/**
 * Set keyboard shortcuts flag to show modal
 */
function showKeyboardShortcutModal() {
    if (isShortcutsModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN, true);
}

/**
 * Unset keyboard shortcuts flag to hide modal
 */
function hideKeyboardShortcutModal() {
    if (!isShortcutsModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN, false);
}

export {
    showKeyboardShortcutModal,
    hideKeyboardShortcutModal,
};
