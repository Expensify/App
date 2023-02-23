import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let closeModal;

/**
 * Allows other parts of the app to call modal close function
 *
 * @param {Function} [onClose]
 */
function setCloseModal(onClose) {
    closeModal = onClose;
}

function close() {
    if (!closeModal) { return; }
    closeModal();
}

/**
 * Allows other parts of the app to know when a modal has been opened or closed
 *
 * @param {Boolean} isVisible
 */
function setModalVisibility(isVisible) {
    Onyx.merge(ONYXKEYS.MODAL, {isVisible});
}

/**
 * Allows other parts of app to know that an alert modal is about to open.
 * This will trigger as soon as a modal is opened but not yet visible while animation is running.
 *
 * @param {Boolean} isVisible
 */
function willAlertModalBecomeVisible(isVisible) {
    Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: isVisible});
}

export {
    setCloseModal,
    close,
    setModalVisibility,
    willAlertModalBecomeVisible,
};
