import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

Onyx.connect({
    key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN,
});

/**
 * Set keyboard shortcuts flag to show modal
 */
function showKeyboardShortcutModal() {
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
