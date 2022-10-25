import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

/**
 * Clear CloseAccount error message to hide modal
 */
function clearError() {
    Onyx.merge(ONYXKEYS.CLOSE_ACCOUNT, {error: ''});
}

/**
 * Set default Onyx data
 */
function setDefaultData() {
    Onyx.merge(ONYXKEYS.CLOSE_ACCOUNT, {...CONST.DEFAULT_CLOSE_ACCOUNT_DATA});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearError,
    setDefaultData,
};
