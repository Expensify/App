import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function triggerUpdateAvailable() {
    Onyx.set(ONYXKEYS.UPDATE_AVAILABLE, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    triggerUpdateAvailable,
};
