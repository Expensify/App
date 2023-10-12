import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let closeModal: (isNavigating: boolean) => void;
let onModalClose: null | (() => void);

/**
 * Allows other parts of the app to call modal close function
 */
function setCloseModal(onClose: () => void) {
    closeModal = onClose;
}

/**
 * Close modal in other parts of the app
 */
function close(onModalCloseCallback: () => void, isNavigating = true) {
    if (!closeModal) {
        // If modal is already closed, no need to wait for modal close. So immediately call callback.
        if (onModalCloseCallback) {
            onModalCloseCallback();
        }
        onModalClose = null;
        return;
    }
    onModalClose = onModalCloseCallback;
    closeModal(isNavigating);
}

function onModalDidClose() {
    if (!onModalClose) {
        return;
    }
    onModalClose();
    onModalClose = null;
}

/**
 * Allows other parts of the app to know when a modal has been opened or closed
 */
function setModalVisibility(isVisible: boolean) {
    Onyx.merge(ONYXKEYS.MODAL, {isVisible});
}

/**
 * Allows other parts of app to know that an alert modal is about to open.
 * This will trigger as soon as a modal is opened but not yet visible while animation is running.
 */
function willAlertModalBecomeVisible(isVisible: boolean) {
    Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: isVisible});
}

export {setCloseModal, close, onModalDidClose, setModalVisibility, willAlertModalBecomeVisible};
