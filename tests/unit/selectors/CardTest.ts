/* eslint-disable @typescript-eslint/naming-convention */
import {defaultExpensifyCardSelector, filterCardsHiddenFromSearch, timeSensitiveCardsSelector} from '@selectors/Card';
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
        expect(defaultExpensifyCardSelector(undefined)).toBeUndefined();
        expect(defaultExpensifyCardSelector({})).toBeUndefined();
    });

    it('Should return undefined if cards do not have Expensify Card bank', () => {
        const allCards: CardList = {
            '1': createRandomCompanyCard(1, {bank: 'vcf'}),
            '2': createRandomCompanyCard(2, {bank: 'stripe'}),
        };

        expect(defaultExpensifyCardSelector(allCards)).toBeUndefined();
    });

    it('Should return undefined if Expensify Card does not have fundID', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: undefined}),
            '2': createRandomExpensifyCard(2, {fundID: ''}),
        };

        expect(defaultExpensifyCardSelector(allCards)).toBeUndefined();
    });

    it('Should return the first Expensify Card feed when multiple Expensify Cards exist', () => {
        const allCards: CardList = {
            '1': createRandomExpensifyCard(1, {fundID: '5555'}),
            '2': createRandomExpensifyCard(2, {fundID: '6666'}),
        };
        const result = defaultExpensifyCardSelector(allCards);
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

        const result = defaultExpensifyCardSelector(allCards);
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
        const result = defaultExpensifyCardSelector(allCards);
        expect(result).toEqual({
            id: '5555_Expensify Card',
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: '5555',
            name: CONST.EXPENSIFY_CARD.BANK,
        });
    });
});

describe('timeSensitiveCardsSelector', () => {
    it('returns empty arrays when cardList is undefined or empty', () => {
        expect(timeSensitiveCardsSelector(undefined)).toEqual({
            cardsNeedingShippingAddress: [],
            cardsNeedingActivation: [],
            cardsWithFraud: [],
        });
        expect(timeSensitiveCardsSelector({})).toEqual({
            cardsNeedingShippingAddress: [],
            cardsNeedingActivation: [],
            cardsWithFraud: [],
        });
    });

    it('returns empty arrays when no physical Expensify cards need action', () => {
        const cardList: CardList = {
            '1': createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE}),
            '2': createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.CLOSED, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE}),
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingShippingAddress).toHaveLength(0);
        expect(result.cardsNeedingActivation).toHaveLength(0);
        expect(result.cardsWithFraud).toHaveLength(0);
    });

    it('identifies cards needing shipping address (STATE_NOT_ISSUED)', () => {
        const cardNeedingShipping = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const openCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

        const cardList: CardList = {
            '1': cardNeedingShipping,
            '2': openCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.cardsNeedingShippingAddress[0].cardID).toBe(1);
        expect(result.cardsNeedingActivation).toHaveLength(0);
    });

    it('identifies cards needing activation (NOT_ACTIVATED)', () => {
        const cardNeedingActivation = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        const openCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

        const cardList: CardList = {
            '1': cardNeedingActivation,
            '2': openCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingShippingAddress).toHaveLength(0);
        expect(result.cardsNeedingActivation).toHaveLength(1);
        expect(result.cardsNeedingActivation[0].cardID).toBe(1);
    });

    it('identifies multiple cards needing different actions', () => {
        const cardNeedingShipping1 = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const cardNeedingShipping2 = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const cardNeedingActivation1 = createRandomExpensifyCard(3, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        const cardNeedingActivation2 = createRandomExpensifyCard(4, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        const openCard = createRandomExpensifyCard(5, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

        const cardList: CardList = {
            '1': cardNeedingShipping1,
            '2': cardNeedingShipping2,
            '3': cardNeedingActivation1,
            '4': cardNeedingActivation2,
            '5': openCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingShippingAddress).toHaveLength(2);
        expect(result.cardsNeedingActivation).toHaveLength(2);
    });

    it('excludes virtual Expensify cards from time-sensitive results', () => {
        const virtualCardNeedingActivation: Card = {
            ...createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED}),
            nameValuePairs: {isVirtual: true} as Card['nameValuePairs'],
        };
        const physicalCardNeedingActivation = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});

        const cardList: CardList = {
            '1': virtualCardNeedingActivation,
            '2': physicalCardNeedingActivation,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingActivation).toHaveLength(1);
        expect(result.cardsNeedingActivation[0].cardID).toBe(2);
    });

    it('excludes non-Expensify cards (company cards) from time-sensitive results', () => {
        const companyCard = createRandomCompanyCard(1, {bank: 'vcf'});
        // Manually set state to match pending issue
        const companyCardWithPendingState: Card = {
            ...companyCard,
            state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED,
        };
        const expensifyCardNeedingShipping = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});

        const cardList: CardList = {
            '1': companyCardWithPendingState,
            '2': expensifyCardNeedingShipping,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.cardsNeedingShippingAddress[0].cardID).toBe(2);
    });

    it('filters out invalid card objects (missing cardID or bank)', () => {
        const validCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const invalidCard1 = {cardID: 2, state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED} as Card;
        const invalidCard2 = {bank: CONST.EXPENSIFY_CARD.BANK, state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED} as Card;

        const cardList: CardList = {
            '1': validCard,
            '2': invalidCard1,
            '3': invalidCard2,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.cardsNeedingShippingAddress[0].cardID).toBe(1);
    });

    it('handles mixed scenarios with various card types and states', () => {
        const physicalExpensifyNeedingShipping = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const physicalExpensifyNeedingActivation = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        const physicalExpensifyOpen = createRandomExpensifyCard(3, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const virtualExpensifyNeedingActivation: Card = {
            ...createRandomExpensifyCard(4, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED}),
            nameValuePairs: {isVirtual: true} as Card['nameValuePairs'],
        };
        const companyCard = createRandomCompanyCard(5, {bank: 'vcf'});
        const suspendedCard = createRandomExpensifyCard(6, {state: CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED});
        const closedCard = createRandomExpensifyCard(7, {state: CONST.EXPENSIFY_CARD.STATE.CLOSED});

        const cardList: CardList = {
            '1': physicalExpensifyNeedingShipping,
            '2': physicalExpensifyNeedingActivation,
            '3': physicalExpensifyOpen,
            '4': virtualExpensifyNeedingActivation,
            '5': companyCard,
            '6': suspendedCard,
            '7': closedCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Only physical Expensify cards with pending states should be included
        expect(result.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.cardsNeedingShippingAddress[0].cardID).toBe(1);
        expect(result.cardsNeedingActivation).toHaveLength(1);
        expect(result.cardsNeedingActivation[0].cardID).toBe(2);
    });

    it('returns cards in correct arrays based on their state', () => {
        // Cards with STATE_NOT_ISSUED should be in cardsNeedingShippingAddress
        // Cards with NOT_ACTIVATED should be in cardsNeedingActivation
        const pendingIssueCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const pendingActivateCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});

        const cardList: CardList = {
            '1': pendingIssueCard,
            '2': pendingActivateCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Verify STATE_NOT_ISSUED (2) goes to cardsNeedingShippingAddress
        expect(result.cardsNeedingShippingAddress.every((card) => card.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED)).toBe(true);

        // Verify NOT_ACTIVATED (4) goes to cardsNeedingActivation
        expect(result.cardsNeedingActivation.every((card) => card.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED)).toBe(true);
    });

    it('identifies cards with domain fraud', () => {
        const cardWithDomainFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN});
        const normalCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithDomainFraud,
            '2': normalCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud[0].cardID).toBe(1);
        expect(result.cardsWithFraud[0].fraud).toBe(CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    });

    it('identifies cards with individual fraud', () => {
        const cardWithIndividualFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL});
        const normalCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithIndividualFraud,
            '2': normalCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud[0].cardID).toBe(1);
        expect(result.cardsWithFraud[0].fraud).toBe(CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);
    });

    it('detects fraud on both physical and virtual Expensify cards', () => {
        const physicalCardWithFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN});
        const virtualCardWithFraud: Card = {
            ...createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL}),
            nameValuePairs: {isVirtual: true} as Card['nameValuePairs'],
        };

        const cardList: CardList = {
            '1': physicalCardWithFraud,
            '2': virtualCardWithFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Both physical and virtual cards with fraud should be included
        expect(result.cardsWithFraud).toHaveLength(2);
    });

    it('excludes non-Expensify cards from fraud detection', () => {
        const companyCardWithFraud: Card = {
            ...createRandomCompanyCard(1, {bank: 'vcf'}),
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
        };
        const expensifyCardWithFraud = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN});

        const cardList: CardList = {
            '1': companyCardWithFraud,
            '2': expensifyCardWithFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Only Expensify card should be included
        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud[0].cardID).toBe(2);
    });

    it('does not include cards with fraud type NONE', () => {
        const cardWithNoFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithNoFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(0);
    });
});
