import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

Onyx.connect({
    key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN,
});

function showKeyboardShortcutModal() {
    Onyx.set(ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN, true);
}

function hideKeyboardShortcutModal() {
    Onyx.set(ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN, false);
}

export {
    showKeyboardShortcutModal,
    hideKeyboardShortcutModal,
};
