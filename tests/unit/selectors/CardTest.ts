/* eslint-disable @typescript-eslint/naming-convention */
import {defaultExpensifyCardSelector, filterCardsHiddenFromSearch} from '@selectors/Card';
import {translateLocal} from 'tests/utils/TestHelper';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Card, CardList} from '@src/types/onyx';
import createRandomCard, {createRandomCompanyCard, createRandomExpensifyCard} from '../../utils/collections/card';

describe('filterCardsHiddenFromSearch', () => {
    it('returns empty object when cardList is undefined or empty', () => {
        expect(filterCardsHiddenFromSearch(undefined)).toEqual({});
        expect(filterCardsHiddenFromSearch({})).toEqual({});
    });

    it('keeps cards that are not hidden from search', () => {
        const card1 = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const card2 = createRandomCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, bank: 'vcf'});

        const cardList: CardList = {
            '1': card1,
            '2': card2,
        };

        const result = filterCardsHiddenFromSearch(cardList);

        expect(result).toMatchObject({
            '1': expect.objectContaining({cardID: 1}),
            '2': expect.objectContaining({cardID: 2}),
        });
    });

    it('filters out non-virtual cards with state 2 (hidden from search)', () => {
        const visibleCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const hiddenCard = createRandomExpensifyCard(2, {state: 2 as ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>});

        const cardList: CardList = {
            '1': visibleCard,
            '2': hiddenCard,
        };

        const result = filterCardsHiddenFromSearch(cardList);

        expect(result?.['1']).toBeDefined();
        expect(result?.['2']).toBeUndefined();
    });

    it('filters out non-virtual cards with state 4 (hidden from search)', () => {
        const visibleCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const hiddenCard = createRandomExpensifyCard(2, {state: 4 as ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>});

        const cardList: CardList = {
            '1': visibleCard,
            '2': hiddenCard,
        };

        const result = filterCardsHiddenFromSearch(cardList);

        expect(result?.['1']).toBeDefined();
        expect(result?.['2']).toBeUndefined();
    });

    it('keeps virtual cards even if they have hidden state', () => {
        const virtualCardWithHiddenState = {
            ...createRandomExpensifyCard(1, {state: 2 as ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>}),
            nameValuePairs: {isVirtual: true},
        } as Card;

        const cardList: CardList = {
            '1': virtualCardWithHiddenState,
        };

        const result = filterCardsHiddenFromSearch(cardList);

        expect(result?.['1']).toBeDefined();
    });

    it('filters out invalid card objects (missing cardID or bank)', () => {
        const validCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const invalidCard1 = {cardID: 2} as Card;
        const invalidCard2 = {bank: 'vcf'} as Card;

        const cardList: CardList = {
            '1': validCard,
            '2': invalidCard1,
            '3': invalidCard2,
        };

        const result = filterCardsHiddenFromSearch(cardList);

        expect(result?.['1']).toBeDefined();
        expect(result?.['2']).toBeUndefined();
        expect(result?.['3']).toBeUndefined();
    });

    it('handles mixed visible and hidden cards', () => {
        const visibleCard1 = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const visibleCard2 = createRandomCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, bank: 'vcf', fundID: undefined});
        const hiddenCard1 = createRandomExpensifyCard(3, {state: 2 as ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>});
        const hiddenCard2 = createRandomExpensifyCard(4, {state: 4 as ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>});
        const virtualHiddenCard: Card = {
            ...createRandomExpensifyCard(5, {state: 2 as ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>}),
            nameValuePairs: {isVirtual: true} as Card['nameValuePairs'],
        };

        const cardList: CardList = {
            '1': visibleCard1,
            '2': visibleCard2,
            '3': hiddenCard1,
            '4': hiddenCard2,
            '5': virtualHiddenCard,
        };

        const result = filterCardsHiddenFromSearch(cardList);

        expect(result?.['1']).toBeDefined();
        expect(result?.['2']).toBeDefined();
        expect(result?.['3']).toBeUndefined();
        expect(result?.['4']).toBeUndefined();
        expect(result?.['5']).toBeDefined(); // Virtual cards are kept even with hidden state
    });
});

describe('defaultExpensifyCardSelector', () => {
    it('Should return undefined if allCards is undefined or empty', () => {
        expect(defaultExpensifyCardSelector(undefined, translateLocal)).toBeUndefined();
        expect(defaultExpensifyCardSelector({}, translateLocal)).toBeUndefined();
    });

    it('Should return undefined if cards do not have Expensify Card bank', () => {
        const allCards: CardList = {
            '1': createRandomCompanyCard(1, {bank: 'vcf'}),
            '2': createRandomCompanyCard(2, {bank: 'stripe'}),
        };

        expect(defaultExpensifyCardSelector(allCards, translateLocal)).toBeUndefined();
    });

    it('Should return undefined if Expensify Card does not have fundID', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: undefined}),
            '2': createRandomExpensifyCard(2, {fundID: ''}),
        };

        expect(defaultExpensifyCardSelector(allCards, translateLocal)).toBeUndefined();
    });

    it('Should return the first Expensify Card feed when multiple Expensify Cards exist', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: '5555'}),
            '2': createRandomExpensifyCard(2, {fundID: '6666'}),
        };
        const result = defaultExpensifyCardSelector(allCards, translateLocal);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });

    it('Should return the first Expensify Card feed when mixed cards exist (some Expensify, some not)', () => {
        const allCards: CardList = {
            '1': createRandomCompanyCard(1, {bank: 'vcf'}),
            '2': createRandomExpensifyCard(2, {fundID: '5555'}),
            '3': createRandomExpensifyCard(3, {fundID: '6666'}),
        };

        const result = defaultExpensifyCardSelector(allCards, translateLocal);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });

    it('Should ignore Expensify Cards without fundID when other Expensify Cards with fundID exist', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: undefined}),
            '2': createRandomExpensifyCard(2, {fundID: '5555'}),
        };
        const result = defaultExpensifyCardSelector(allCards, translateLocal);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });
});
