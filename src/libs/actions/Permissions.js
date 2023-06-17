import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setActionAsForbidden() {
    Onyx.set(ONYXKEYS.IS_ACTION_FORBIDDEN, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setActionAsForbidden,
};
