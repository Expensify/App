import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Clear CloseAccount error message to hide modal
 */
function clearError() {
    Onyx.merge(ONYXKEYS.CLOSE_ACCOUNT, {error: ''});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearError,
};
