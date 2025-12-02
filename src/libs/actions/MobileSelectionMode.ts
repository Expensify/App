import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const turnOnMobileSelectionMode = () => {
    Onyx.merge(ONYXKEYS.MOBILE_SELECTION_MODE, true);
};

const turnOffMobileSelectionMode = () => {
    Onyx.merge(ONYXKEYS.MOBILE_SELECTION_MODE, false);
};

export {turnOnMobileSelectionMode, turnOffMobileSelectionMode};
