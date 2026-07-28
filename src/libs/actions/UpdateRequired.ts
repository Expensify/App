import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function alertUser() {
    Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    alertUser,
};
