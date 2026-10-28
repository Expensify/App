import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

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
        ['a report, add US bank account', '/r/123/add-us-bank-account', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['the wallet, add US bank account', '/settings/wallet/add-us-bank-account', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['the wallet, add US bank account entry point', '/settings/wallet/add-us-bank-account/entry-point', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['a report, enter signer info', '/r/123/enter-signer-info?policyID=1&bankAccountID=2&isCompleted=false', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['Home, enter signer info', '/home/enter-signer-info?policyID=1&bankAccountID=2&isCompleted=false', SCREENS.HOME, undefined],
        ['Home, Expensify Card details', '/home/card/777', SCREENS.HOME, undefined],
        ['Home, activate Expensify Card', '/home/card/777/activate/778', SCREENS.HOME, undefined],
        ['Home, reveal Expensify Card details', '/home/card/777/reveal-validate-code/778', SCREENS.HOME, undefined],
        ['Home, update Expensify Card address', '/home/card/777/digital-details/update-address', SCREENS.HOME, undefined],
        ['Home, change Expensify Card PIN', '/home/card/777/change-pin/778', SCREENS.HOME, undefined],
        ['Home, change Expensify Card PIN at an ATM', '/home/card/777/change-pin-atm', SCREENS.HOME, undefined],
        ['Home, report virtual card fraud', '/home/card/777/report-virtual-fraud/778', SCREENS.HOME, undefined],
        ['Home, verify virtual card fraud report', '/home/card/777/report-virtual-fraud/778/fraud-validate-code', SCREENS.HOME, undefined],
        ['Home, virtual card fraud confirmation', '/home/card/777/report-virtual-fraud-confirm/779', SCREENS.HOME, undefined],
        ['Home, report card lost or damaged', '/home/card/777/report-card-lost-or-damaged/778', SCREENS.HOME, undefined],
        ['Home, verify card replacement', '/home/card/777/report-card-lost-or-damaged/778/replace-validate-code/damaged', SCREENS.HOME, undefined],
        ['the wallet, Expensify Card details', '/settings/wallet/card/777', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['the wallet, activate Expensify Card', '/settings/wallet/card/777/activate/778', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['the wallet, report virtual card fraud', '/settings/wallet/card/777/report-virtual-fraud/778', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
        ['the wallet, report card lost or damaged', '/settings/wallet/card/777/report-card-lost-or-damaged/778', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.WALLET.ROOT],
    ])('keeps the full screen it was opened from: %s', (_label, path, name, central) => {
        // Given an RHP URL that carries the page it was opened from as its base
        // When it is loaded directly or refreshed
        const fullScreen = getFullScreenUnderRHP(path);

        // Then that page is rebuilt under the RHP, so closing the RHP returns to it
        expect(fullScreen).toEqual({name, central});
    });
});

describe('Expensify Card routes that must keep their own page', () => {
    it.each([
        ['the domain card detail', '/settings/card/777', SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL],
        ['the domain card fraud report', '/settings/card/777/report-virtual-fraud', SCREENS.DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD],
    ])('%s is not taken over by the wallet card suffix', (_label, path, screen) => {
        // Given a Domains card URL that ends the same way as the wallet card suffix, but whose base is not Wallet or Home
        // When it is loaded directly or refreshed
        const state = getAdaptedStateFromPath(path, undefined);

        // Then it still resolves to its own Domains screen
        expect(state ? findFocusedRoute(state)?.name : undefined).toBe(screen);
    });
});

describe('Expensify Card child routes', () => {
    it.each([
        ['activate', '/settings/wallet/card/777/activate/778', SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_ACTIVATE],
        ['change PIN', '/home/card/777/change-pin/778', SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_CHANGE_PIN],
        ['report virtual card fraud', '/home/card/777/report-virtual-fraud/778', SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD],
        ['verify virtual card fraud report', '/home/card/777/report-virtual-fraud/778/fraud-validate-code', SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD_CONFIRM_VALIDATE_CODE],
        [
            'verify card replacement',
            '/home/card/777/report-card-lost-or-damaged/778/replace-validate-code/damaged',
            SCREENS.SETTINGS.DYNAMIC_REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_VALIDATE_CODE,
        ],
    ])('%s acts on the card in its own suffix', (_label, path, screen) => {
        // Given a card page opened for one card of a combo card (777) whose child acts on the other card (778)
        // When the child URL is loaded directly or refreshed
        const state = getAdaptedStateFromPath(path, undefined);
        const focusedRoute = state ? findFocusedRoute(state) : undefined;

        // Then the child screen gets the card from its own suffix rather than the page's card
        expect(focusedRoute?.name).toBe(screen);
        expect(focusedRoute?.params).toEqual(expect.objectContaining({cardID: '778'}));
    });

    it('stacks the Domains travel fraud report on the Domains card detail', () => {
        // Given a travel card fraud report opened from the Domains card detail page
        // When it is loaded directly or refreshed
        const state = getAdaptedStateFromPath('/settings/card/777/report-virtual-fraud/778', undefined);

        // Then it opens the wallet fraud report for the travel card, not the Domains one for the page's card
        const focusedRoute = state ? findFocusedRoute(state) : undefined;
        expect(focusedRoute?.name).toBe(SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD);
        expect(focusedRoute?.params).toEqual(expect.objectContaining({cardID: '778'}));
    });
});

describe('add US bank account routes', () => {
    it.each([
        ['the entry point', '/settings/wallet/add-us-bank-account/entry-point', SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT_ENTRY_POINT, {}],
        ['a flow step', '/settings/wallet/add-us-bank-account/manual', SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT, {subPage: 'manual'}],
        [
            'a flow step opened from the entry point',
            '/settings/wallet/add-us-bank-account/entry-point/add-us-bank-account/manual',
            SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT,
            {subPage: 'manual'},
        ],
    ])('resolves %s to its own screen', (_label, path, screen, expectedParams) => {
        // Given the entry point and the flow, whose URLs share the add-us-bank-account prefix
        // When the URL is loaded directly or refreshed
        const state = getAdaptedStateFromPath(path, undefined);
        const focusedRoute = state ? findFocusedRoute(state) : undefined;

        // Then the entry point is not read as a flow step called "entry-point", and a flow step keeps its sub page
        expect(focusedRoute?.name).toBe(screen);
        expect(focusedRoute?.params ?? {}).toMatchObject(expectedParams);
    });
});
