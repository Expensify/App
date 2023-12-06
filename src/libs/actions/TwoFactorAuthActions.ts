import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {Route} from '@src/ROUTES';
import {TwoFactorAuthStep} from '@src/types/onyx/Account';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {recoveryCodes: null, twoFactorAuthSecretKey: null, twoFactorAuthStep: null, codesAreCopied: false});
}
function setTwoFactorAuthStep(twoFactorAuthStep: TwoFactorAuthStep) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthStep});
}

function setCodesAreCopied() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {codesAreCopied: true});
}

function quitAndNavigateBack(backTo?: Route) {
    clearTwoFactorAuthData();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    Navigation.goBack(backTo || ROUTES.SETTINGS_SECURITY);
}

export {clearTwoFactorAuthData, setTwoFactorAuthStep, quitAndNavigateBack, setCodesAreCopied};
