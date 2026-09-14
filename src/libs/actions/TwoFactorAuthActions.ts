import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Account} from '@src/types/onyx';

import type {NullishDeep} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData(clearProgress = false) {
    const data: NullishDeep<Account> = {recoveryCodes: null, twoFactorAuthSecretKey: null, codesAreCopied: false};

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
