import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

/**
 * Set default Onyx data
 */
function setDefaultData() {
    Onyx.merge(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, {...CONST.DEFAULT_CLOSE_ACCOUNT_DATA});
}

export default {
    setDefaultData,
};
