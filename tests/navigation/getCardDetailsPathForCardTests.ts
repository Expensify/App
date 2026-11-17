import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getCardDetailsPathForCard from '@libs/Navigation/helpers/getCardDetailsPathForCard';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

describe('getCardDetailsPathForCard', () => {
    it.each([
        ['the wallet', createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute('111'), ROUTES.SETTINGS_WALLET), 'settings/wallet/card/222'],
        ['Home', createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute('111'), ROUTES.HOME), 'home/card/222'],
        ['the Domains page', ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute('111'), 'settings/card/222'],
    ])('points a card page opened from %s at the replacement card', (_label, cardDetailsPath, expected) => {
        // Given the page of a card that was just reported and replaced
        // When it is pointed at the replacement card
        const path = getCardDetailsPathForCard(cardDetailsPath, '222');

        // Then it keeps the page it was opened from
        expect(path).toBe(expected);
    });

    it('keeps the card page while there is no replacement card yet', () => {
        // Given the card page under the replace card code page, before any replacement card exists
        const cardDetailsPath = createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute('111'), ROUTES.HOME);

        // When it is pointed at the still-empty replacement card ID
        const path = getCardDetailsPathForCard(cardDetailsPath, '');

        // Then it returns the same card page instead of throwing on an empty card suffix
        expect(path).toBe('home/card/111');
    });
});
