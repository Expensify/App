import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isBugReportModalOpen;
Onyx.connect({
    key: ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN,
    callback: flag => isBugReportModalOpen = flag,
});

/**
 * Set keyboard shortcuts flag to show modal
 */
function showKeyboardShortcutModal() {
    if (isBugReportModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, true);
}

/**
 * Unset keyboard shortcuts flag to hide modal
 */
function hideKeyboardShortcutModal() {
    if (!isBugReportModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, false);
}

export {
    showKeyboardShortcutModal,
    hideKeyboardShortcutModal,
};
