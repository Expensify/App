import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Unset CloseAccount error message to hide modal
 */
function hideCloseAccountErrorModal() {
    Onyx.merge(ONYXKEYS.CLOSE_ACCOUNT, {error: ''});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    hideCloseAccountErrorModal,
};
