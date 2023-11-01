import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const closeModals: Record<number, null | ((isNavigating: boolean) => void)> = {};
let count = 0;

let onModalClose: null | (() => void);

/**
 * Get the available key that we can store the onClose callback into it
 */
function getAvailableKey() {
    return count++;
}

/**
 * Allows other parts of the app to call modal close function
 */
function setCloseModal(key: number, onClose: () => void) {
    closeModals[key] = onClose;
}

/**
 * Close modal in other parts of the app
 */
function close(onModalCloseCallback: () => void, isNavigating = true) {
    onModalClose = onModalCloseCallback;
    Object.values(closeModals)
        .reverse()
        .forEach((onClose) => {
            if (typeof onClose !== 'function') {
                return;
            }
            onClose(isNavigating);
        });
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

export {setCloseModal, close, onModalDidClose, setModalVisibility, willAlertModalBecomeVisible, getAvailableKey};
