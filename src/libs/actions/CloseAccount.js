import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isCloseAccountErrorModalOpen;
Onyx.connect({
    key: ONYXKEYS.CLOSE_ACCOUNT,
    callback: data => isCloseAccountErrorModalOpen = Boolean(data && data.error),
});

/**
 * Unset CloseAccount error message to hide modal
 */
function hideCloseAccountErrorModal() {
    if (!isCloseAccountErrorModalOpen) {
        return;
    }
    Onyx.merge(ONYXKEYS.CLOSE_ACCOUNT, {error: ''});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    hideCloseAccountErrorModal,
};
