import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Account} from '@src/types/onyx';

import type {OnyxEntry, OnyxMergeInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// Read only when leaving the flow, so this does not need to re-render any screen.
let account: OnyxEntry<Account>;
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
    },
});

/**
 * Clear 2FA data if the flow is interrupted without finishing.
 * An unfinished setup keeps its secret and recovery codes. Wiping them makes the codes page
 * call EnableTwoFactorAuth again, and the server replaces the secret the authenticator already has.
 */
function clearTwoFactorAuthData(clearProgress = false) {
    const data: OnyxMergeInput<typeof ONYXKEYS.ACCOUNT> = {codesAreCopied: false};

    // Setup is finished only once the server has enabled 2FA. Until then the pending secret is still valid.
    if (account?.requiresTwoFactorAuth) {
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

function quitAndNavigateBack(backTo?: Route) {
    Navigation.goBack(backTo, {afterTransition: clearTwoFactorAuthData});
}

export {clearTwoFactorAuthData, quitAndNavigateBack, setCodesAreCopied};
