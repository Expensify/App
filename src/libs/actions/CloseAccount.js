import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

/**
 * Clear CloseAccount error message to hide modal
 */
function clearError() {
    Onyx.merge(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, {error: '', errors: null});
}

/**
 * Set default Onyx data
 */
function setDefaultData() {
    Onyx.merge(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, {...CONST.DEFAULT_CLOSE_ACCOUNT_DATA});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearError,
    setDefaultData,
};
