import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const turnOnMobileSelectionMode = () => {
    Onyx.merge(ONYXKEYS.MOBILE_SELECTION_MODE, {isEnabled: true});
};

const turnOffMobileSelectionMode = () => {
    Onyx.merge(ONYXKEYS.MOBILE_SELECTION_MODE, {isEnabled: false, exportAll: false});
};

const turnOnExportAllMode = () => {
    Onyx.merge(ONYXKEYS.MOBILE_SELECTION_MODE, {exportAll: true});
};

const turnOffExportAllMode = () => {
    Onyx.merge(ONYXKEYS.MOBILE_SELECTION_MODE, {exportAll: false});
};

export {turnOnMobileSelectionMode, turnOffMobileSelectionMode, turnOnExportAllMode, turnOffExportAllMode};
