import {RHP_TO_HOME, RHP_TO_HOME_DEEPLINK, RHP_TO_SETTINGS, RHP_TO_SETTINGS_DEEPLINK} from '@libs/Navigation/linkingConfig/RELATIONS';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getFullScreenUnderRHP from '../utils/getFullScreenUnderRHP';

describe('RHP screens opened from a chat or Home', () => {
    it.each([
        [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS, SCREENS.SETTINGS.WALLET.ROOT],
        [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT, SCREENS.SETTINGS.WALLET.ROOT],
        [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD, SCREENS.SETTINGS.SUBSCRIPTION.ROOT],
    ])('%s is pinned to %s only for a deep link', (screen, settingsScreen) => {
        expect(RHP_TO_SETTINGS[screen]).toBeUndefined();
        expect(RHP_TO_SETTINGS_DEEPLINK[screen]).toBe(settingsScreen);
    });

    it('enter signer info is pinned to Home only for a deep link', () => {
        expect(RHP_TO_HOME[SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO]).toBeUndefined();
        expect(RHP_TO_HOME_DEEPLINK[SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO]).toBe(SCREENS.HOME);
    });

    it.each([
        ['/settings/wallet/personal-card/123', SCREENS.SETTINGS.WALLET.ROOT],
        ['/settings/wallet/add-us-bank-account', SCREENS.SETTINGS.WALLET.ROOT],
        ['/settings/subscription/add-payment-card', SCREENS.SETTINGS.SUBSCRIPTION.ROOT],
    ])('%s still lands on the settings page on a fresh load', (path, settingsScreen) => {
        expect(getFullScreenUnderRHP(path)).toEqual({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, central: settingsScreen});
    });

    it('enter signer info still lands on Home on a fresh load', () => {
        expect(getFullScreenUnderRHP('/bank-account/enter-signer-info/name').name).toBe(SCREENS.HOME);
    });
});
