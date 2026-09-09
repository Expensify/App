import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function setIsOpenAppFailureModalOpen(isOpen: boolean) {
    Onyx.merge(ONYXKEYS.IS_OPEN_APP_FAILURE_MODAL_OPEN, isOpen);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setIsOpenAppFailureModalOpen,
};
