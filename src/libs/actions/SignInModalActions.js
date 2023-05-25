import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isSignInModalOpen;
Onyx.connect({
    key: ONYXKEYS.IS_SIGN_IN_MODAL_OPEN,
    callback: (flag) => (isSignInModalOpen = flag),
});

/**
 * Set isSignInModalOpen flag to show modal
 */
function showSignInModal() {
    if (isSignInModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_SIGN_IN_MODAL_OPEN, true);
}

/**
 * Unset isSignInModalOpen flag to hide modal
 */
function hideSignInModal() {
    if (!isSignInModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_SIGN_IN_MODAL_OPEN, false);
}

export {showSignInModal, hideSignInModal};
