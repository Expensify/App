import Onyx from 'react-native-onyx';
import {Keyboard} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Hide the modal, if it is shown.
 */
function modalHide() {
    Keyboard.dismiss();
    Onyx.set(ONYXKEYS.MODAL.IS_SHOWN, false);
}

/**
 * Show the modal, if it is hidden and also set modal type.
 */

function modalShow(modalType) {
    Keyboard.dismiss();
    Onyx.set(ONYXKEYS.MODAL.IS_SHOWN, true);
    Onyx.set(ONYXKEYS.MODAL.TYPE, modalType);
}

export {
    modalHide,
    modalShow,
};
