import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {recoveryCodes: '', twoFactorAuthSecretKey: ''});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearTwoFactorAuthData,
};
