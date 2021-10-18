import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Allows other parts of the app to know when a modal has been opened or closed
 *
 * @param {Boolean} isVisible
 * @param {Boolean} isAlert
 */
function setModalVisibility(isVisible, isAlert) {
    Onyx.merge(ONYXKEYS.MODAL, {isVisible, isAlertModalVisible: isAlert ? isVisible : false});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setModalVisibility,
};
