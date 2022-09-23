import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const modalStatus = {};
Onyx.connect({
    key: ONYXKEYS.MODAL,
    callback: (val = {}) => {
        modalStatus.isVisible = val.isVisible;
        modalStatus.willAlertModalBecomeVisible = val.willAlertModalBecomeVisible;
    },
});

/**
 * Allows other parts of the app to know when a modal has been opened or closed
 *
 * @param {Boolean} isVisible
 */
function setModalVisibility(isVisible) {
    if (modalStatus.isVisible === isVisible) {
        return;
    }

    modalStatus.isVisible = isVisible;
    Onyx.merge(ONYXKEYS.MODAL, {isVisible});
}

/**
 * Allows other parts of app to know that an alert modal is about to open.
 * This will trigger as soon as a modal is opened but not yet visible while animation is running.
 *
 * @param {Boolean} isVisible
 */
function willAlertModalBecomeVisible(isVisible) {
    if (modalStatus.willAlertBecomeVisible === isVisible) {
        return;
    }

    modalStatus.willAlertBecomeVisible = isVisible;
    Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: isVisible});
}

export {
    setModalVisibility,
    willAlertModalBecomeVisible,
};
