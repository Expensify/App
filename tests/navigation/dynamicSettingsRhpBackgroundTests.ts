import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getFullScreenUnderRHP from '../utils/getFullScreenUnderRHP';

describe('dynamic settings RHP screens on a fresh load', () => {
    it.each([
        ['a report', '/r/123/app-download-links', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['an expense report', '/search/view/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT],
        ['a money request report', '/search/r/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT],
        ['the about page', '/settings/about/app-download-links', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.ABOUT],
        ['a report, add payment card', '/r/123/add-payment-card', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['the subscription page', '/settings/subscription/add-payment-card', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.SUBSCRIPTION.ROOT],
        ['Teachers Unite, add payment card', '/settings/teachersunite/add-payment-card', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.SAVE_THE_WORLD],
        ['a report, personal card details', '/r/123/personal-card/456', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['a report, personal card name', '/r/123/personal-card/456/edit-card-name', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['a report, personal card fix connection', '/r/123/personal-card/456/fix-connection', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['Home, personal card details', '/home/personal-card/456', SCREENS.HOME, undefined],
        ['the wallet, personal card details', '/settings/wallet/personal-card/456', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['the wallet, personal card start date', '/settings/wallet/personal-card/456/edit-transaction-start-date', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['a report, add US bank account', '/r/123/us-bank-account', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['the wallet, add US bank account', '/settings/wallet/us-bank-account', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['a report, enter signer info', '/r/123/enter-signer-info?policyID=1&bankAccountID=2&isCompleted=false', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['Home, enter signer info', '/home/enter-signer-info?policyID=1&bankAccountID=2&isCompleted=false', SCREENS.HOME, undefined],
    ])('keeps the full screen it was opened from: %s', (_label, path, name, central) => {
        // Given an RHP URL that carries the page it was opened from as its base
        // When it is loaded directly or refreshed
        const fullScreen = getFullScreenUnderRHP(path);

        // Then that page is rebuilt under the RHP, so closing the RHP returns to it
        expect(fullScreen).toEqual({name, central});
    });
});
