import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

import type {OnyxMergeInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Clear 2FA data if the flow is interrupted without finishing.
 * An unfinished setup keeps its secret and recovery codes. Wiping them makes the codes page
 * call EnableTwoFactorAuth again, and the server replaces the secret the authenticator already has.
 */
function clearTwoFactorAuthData(is2FAEnabled: boolean, clearProgress = false) {
    const data: OnyxMergeInput<typeof ONYXKEYS.ACCOUNT> = {codesAreCopied: false};

    // Setup is finished only once the server has enabled 2FA. Until then the pending secret is still valid.
    if (is2FAEnabled) {
        data.recoveryCodes = null;
        data.twoFactorAuthSecretKey = null;
    }

    if (clearProgress) {
        data.twoFactorAuthSetupInProgress = null;
    }

    Onyx.merge(ONYXKEYS.ACCOUNT, data);
}

function setCodesAreCopied() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {codesAreCopied: true, twoFactorAuthSetupInProgress: true});
}

function quitAndNavigateBack(is2FAEnabled: boolean, backTo?: Route) {
    Navigation.goBack(backTo, {afterTransition: () => clearTwoFactorAuthData(is2FAEnabled)});
}

export {clearTwoFactorAuthData, quitAndNavigateBack, setCodesAreCopied};
