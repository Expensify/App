import {RHP_TO_SETTINGS, RHP_TO_SETTINGS_DEEPLINK} from '@libs/Navigation/linkingConfig/RELATIONS';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getFullScreenUnderRHP from '../utils/getFullScreenUnderRHP';

describe('Wallet card screens opened from Home', () => {
    it.each([SCREENS.SETTINGS.WALLET.DOMAIN_CARD, SCREENS.SETTINGS.WALLET.CARD_ACTIVATE])('%s is pinned to the wallet only for a deep link', (screen) => {
        // Given a card screen that Home opens with a click
        // When the relation maps are read
        // Then only the deep-link map pins the wallet, so a click keeps Home behind the RHP
        expect(RHP_TO_SETTINGS[screen]).toBeUndefined();
        expect(RHP_TO_SETTINGS_DEEPLINK[screen]).toBe(SCREENS.SETTINGS.WALLET.ROOT);
    });

    it.each(['/settings/wallet/card/123', '/settings/wallet/card/123/activate'])('%s still lands on the wallet on a fresh load', (path) => {
        // Given a card URL, which does not say which page it was opened from
        // When it is loaded directly or refreshed
        const fullScreen = getFullScreenUnderRHP(path);

        // Then the wallet is placed under the RHP
        expect(fullScreen).toEqual({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, central: SCREENS.SETTINGS.WALLET.ROOT});
    });
});
