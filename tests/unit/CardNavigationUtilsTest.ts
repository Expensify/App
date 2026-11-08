import navigateToCardTransactions, {getUnsubmittedCardTransactionsRoute} from '@libs/CardNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

describe('card transaction navigation', () => {
    it.each([[123], [123, 456]])('scopes unsubmitted expenses to the supplied cards: %j', (...cardIDs) => {
        // Given the cards whose unsubmitted expenses would be deleted
        const route = getUnsubmittedCardTransactionsRoute(cardIDs);

        // When reading the search embedded in the destination
        const query = new URL(route ?? '', 'https://new.expensify.com').searchParams.get('q');

        // Then only unreported and draft expenses on those cards are requested, without a workspace restriction
        expect(query).toContain('type:expense');
        expect(query).toContain('status:unreported,drafts');
        expect(query).toContain(`cardID:${cardIDs.join(',')}`);
        expect(query).not.toContain('policy:');
        expect(query).not.toContain('approved');
        expect(query).not.toContain('paid');
    });

    it('does not create an unrestricted destination when no cards are supplied', () => {
        // Given no affected cards
        // When building the destination
        const route = getUnsubmittedCardTransactionsRoute([]);

        // Then no link to a broader search is offered
        expect(route).toBeUndefined();
    });

    it('keeps the existing view-transactions action unrestricted by status', () => {
        // Given the ordinary view-transactions action
        // When opening a card's full transaction history
        navigateToCardTransactions('123');

        // Then it still navigates without restricting expense status
        const route = jest.mocked(Navigation.navigate).mock.calls.at(-1)?.at(0);
        expect(route).toEqual(expect.stringContaining('cardID%3A123'));
        expect(route).not.toEqual(expect.stringContaining('unreported'));
        expect(route).not.toEqual(expect.stringContaining('drafts'));
    });
});
