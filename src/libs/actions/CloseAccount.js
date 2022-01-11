import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isCloseAccountModalOpen;
Onyx.connect({
    key: ONYXKEYS.IS_CLOSE_ACCOUNT_MODAL_OPEN,
    callback: flag => isCloseAccountModalOpen = flag,
});

/**
 * Set CloseAccount flag to show modal
 */
function showCloseAccountModal() {
    if (isCloseAccountModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_CLOSE_ACCOUNT_MODAL_OPEN, true);
}

/**
* Unset CloseAccount flag to hide modal
 */
function hideCloseAccountModal() {
    if (!isCloseAccountModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_CLOSE_ACCOUNT_MODAL_OPEN, false);
}

export {
    showCloseAccountModal,
    hideCloseAccountModal,
};
