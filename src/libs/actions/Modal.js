import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Allows other parts of the app to know when a modal has been opened or closed
 *
 * @param {bool} isVisible
 */
function setModalVisibility(isVisible) {
    Onyx.merge(ONYXKEYS.MODAL, {isVisible});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setModalVisibility,
};
