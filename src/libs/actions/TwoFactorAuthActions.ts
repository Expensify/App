import {InteractionManager} from 'react-native';
import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

/**
 * Clear 2FA data if the flow is interrupted without finishing
 */
function clearTwoFactorAuthData(clearProgress = false) {
    const data: OnyxMergeInput<typeof ONYXKEYS.ACCOUNT> = {recoveryCodes: null, twoFactorAuthSecretKey: null, codesAreCopied: false};

    if (clearProgress) {
        data.twoFactorAuthSetupInProgress = null;
    }

    Onyx.merge(ONYXKEYS.ACCOUNT, data);
}

function setCodesAreCopied() {
    Onyx.merge(ONYXKEYS.ACCOUNT, {codesAreCopied: true, twoFactorAuthSetupInProgress: true});
}

function quitAndNavigateBack(backTo?: Route) {
    Navigation.goBack(backTo);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(clearTwoFactorAuthData);
}

export {clearTwoFactorAuthData, quitAndNavigateBack, setCodesAreCopied};
