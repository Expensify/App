import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {TwoFactorAuthStep} from '@src/types/onyx/Account';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {recoveryCodes: '', twoFactorAuthSecretKey: '', twoFactorAuthStep: '', codesAreCopied: false});
}
function setTwoFactorAuthStep(twoFactorAuthStep: TwoFactorAuthStep) {
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
