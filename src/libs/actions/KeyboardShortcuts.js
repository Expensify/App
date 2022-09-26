import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isShortcutsModalOpen;
Onyx.connect({
    key: ONYXKEYS.APP,
    callback: val => isShortcutsModalOpen = Boolean(val && val.isShortcutsModalOpen),
});

/**
 * Set keyboard shortcuts flag to show modal
 */
function showKeyboardShortcutModal() {
    if (isShortcutsModalOpen) {
        return;
    }

    Onyx.merge(ONYXKEYS.APP, {isShortcutsModalOpen: true});
}

/**
 * Unset keyboard shortcuts flag to hide modal
 */
function hideKeyboardShortcutModal() {
    if (!isShortcutsModalOpen) {
        return;
    }

    Onyx.merge(ONYXKEYS.APP, {isShortcutsModalOpen: false});
}

export {
    showKeyboardShortcutModal,
    hideKeyboardShortcutModal,
};
