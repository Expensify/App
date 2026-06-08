import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function alertUser() {
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    alertUser,
};
