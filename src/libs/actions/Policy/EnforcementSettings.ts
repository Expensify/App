import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PendingEnforcementSetting} from '@src/types/onyx';

function setPendingEnforcementSetting(setting: PendingEnforcementSetting) {
    Onyx.set(ONYXKEYS.PENDING_ENFORCEMENT_SETTING, setting);
}

function clearPendingEnforcementSetting() {
    Onyx.set(ONYXKEYS.PENDING_ENFORCEMENT_SETTING, null);
}

export {setPendingEnforcementSetting, clearPendingEnforcementSetting};
