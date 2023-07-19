import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {recoveryCodes: '', twoFactorAuthSecretKey: '', twoFactorAuthStep: ''});
}

function setTwoFactorAuthStep(twoFactorAuthStep) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthStep});
}

function quitAndNavigateBackToSettings() {
    clearTwoFactorAuthData();
    Navigation.goBack(ROUTES.SETTINGS_SECURITY);
}

export {clearTwoFactorAuthData, setTwoFactorAuthStep, quitAndNavigateBackToSettings};
