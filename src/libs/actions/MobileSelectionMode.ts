import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const turnOnMobileSelectionMode = () => {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE, true);
};

const turnOffMobileSelectionMode = () => {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE, false);
};

export {turnOnMobileSelectionMode, turnOffMobileSelectionMode};
