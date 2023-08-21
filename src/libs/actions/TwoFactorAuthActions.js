import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {recoveryCodes: '', twoFactorAuthSecretKey: '', twoFactorAuthStep: '', codesAreCopied: false});
}

function setTwoFactorAuthStep(twoFactorAuthStep) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthStep});
}

function setCodesAreCopied() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {codesAreCopied: true});
}

function quitAndNavigateBackToSettings() {
    clearTwoFactorAuthData();
    Navigation.goBack(ROUTES.SETTINGS_SECURITY);
}

export {clearTwoFactorAuthData, setTwoFactorAuthStep, quitAndNavigateBackToSettings, setCodesAreCopied};
