import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Toggle whether the audit trail (gray-text system messages) is shown in expense reports.
 */
function setShowAuditTrail(isOn: boolean) {
    Onyx.set(ONYXKEYS.SHOW_AUDIT_TRAIL, isOn);
}

// eslint-disable-next-line import/prefer-default-export
export {setShowAuditTrail};
