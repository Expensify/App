import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsGPSInProgressModalOpen(isOpen: boolean) {
    Onyx.merge(ONYXKEYS.IS_GPS_IN_PROGRESS_MODAL_OPEN, isOpen);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setIsGPSInProgressModalOpen,
};
