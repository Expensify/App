/* eslint-disable @typescript-eslint/naming-convention */
import {areAllExpensifyCardsShipped, defaultExpensifyCardSelector, filterCardsHiddenFromSearch, filterOutPersonalCards, timeSensitiveCardsSelector} from '@selectors/Card';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Card, CardList} from '@src/types/onyx';
import createRandomCard, {createRandomCompanyCard, createRandomExpensifyCard} from '../../utils/collections/card';
import {translateLocal} from '../../utils/TestHelper';

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
        expect(result.cardsNeedingShippingAddress.at(0)?.cardID).toBe(1);
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
        expect(result.cardsNeedingActivation.at(0)?.cardID).toBe(1);
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
        expect(result.cardsNeedingActivation.at(0)?.cardID).toBe(2);
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
        expect(result.cardsNeedingShippingAddress.at(0)?.cardID).toBe(2);
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
        expect(result.cardsNeedingShippingAddress.at(0)?.cardID).toBe(1);
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
        expect(result.cardsNeedingShippingAddress.at(0)?.cardID).toBe(1);
        expect(result.cardsNeedingActivation).toHaveLength(1);
        expect(result.cardsNeedingActivation.at(0)?.cardID).toBe(2);
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
        const cardWithDomainFraud = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 5000, triggerMerchant: 'Test Merchant', currency: 'USD', fraudAlertReportID: 123},
        });
        const normalCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithDomainFraud,
            '2': normalCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud.at(0)?.cardID).toBe(1);
        expect(result.cardsWithFraud.at(0)?.fraud).toBe(CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
        expect(result.cardsWithFraud.at(0)?.nameValuePairs?.possibleFraud?.triggerAmount).toBe(5000);
    });

    it('identifies cards with individual fraud', () => {
        const cardWithIndividualFraud = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL,
            possibleFraud: {triggerAmount: 3000, triggerMerchant: 'Suspicious Shop', currency: 'USD', fraudAlertReportID: 456},
        });
        const normalCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithIndividualFraud,
            '2': normalCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud.at(0)?.cardID).toBe(1);
        expect(result.cardsWithFraud.at(0)?.fraud).toBe(CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);
        expect(result.cardsWithFraud.at(0)?.nameValuePairs?.possibleFraud?.triggerMerchant).toBe('Suspicious Shop');
    });

    it('detects fraud on both physical and virtual Expensify cards', () => {
        const physicalCardWithFraud = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 5000, triggerMerchant: 'Store A', currency: 'USD', fraudAlertReportID: 111},
        });
        const virtualCardWithFraud: Card = {
            ...createRandomExpensifyCard(2, {
                state: CONST.EXPENSIFY_CARD.STATE.OPEN,
                fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL,
                possibleFraud: {triggerAmount: 2000, triggerMerchant: 'Store B', currency: 'USD', fraudAlertReportID: 222},
            }),
            nameValuePairs: {
                isVirtual: true,
                possibleFraud: {triggerAmount: 2000, triggerMerchant: 'Store B', currency: 'USD', fraudAlertReportID: 222},
            } as Card['nameValuePairs'],
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
        const expensifyCardWithFraud = createRandomExpensifyCard(2, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 7500, triggerMerchant: 'Online Store', currency: 'USD', fraudAlertReportID: 789},
        });

        const cardList: CardList = {
            '1': companyCardWithFraud,
            '2': expensifyCardWithFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Only Expensify card should be included
        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud.at(0)?.cardID).toBe(2);
    });

    it('does not include cards with fraud type NONE and no possibleFraud data', () => {
        const cardWithNoFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithNoFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(0);
    });

    it('includes cards with fraud type NONE when possibleFraud data exists in nameValuePairs', () => {
        const cardWithPendingFraudAlert = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            possibleFraud: {triggerAmount: 5663, triggerMerchant: 'WAL-MART #2366', currency: 'USD', fraudAlertReportID: 5230242215684213},
        });
        const normalCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});

        const cardList: CardList = {
            '1': cardWithPendingFraudAlert,
            '2': normalCard,
        };

        const result = timeSensitiveCardsSelector(cardList);

        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud.at(0)?.cardID).toBe(1);
        expect(result.cardsWithFraud.at(0)?.nameValuePairs?.possibleFraud?.triggerAmount).toBe(5663);
    });

    it('excludes fraud cards that have fraud flag but no possibleFraud data (prevents empty Time Sensitive section)', () => {
        // This is the exact scenario that caused the empty "Time sensitive" block:
        // card.fraud is set (e.g., 'domain') but possibleFraud is missing from nameValuePairs
        const cardWithDomainFraudNoPossibleFraud = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
        });
        const cardWithIndividualFraudNoPossibleFraud = createRandomExpensifyCard(2, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL,
        });

        const cardList: CardList = {
            '1': cardWithDomainFraudNoPossibleFraud,
            '2': cardWithIndividualFraudNoPossibleFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Both cards should be excluded because they lack possibleFraud data needed for rendering
        expect(result.cardsWithFraud).toHaveLength(0);
    });

    it('excludes fraud cards that have possibleFraud but no fraudAlertReportID', () => {
        const cardWithFraudNoReportID = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 5000, triggerMerchant: 'Test Merchant', currency: 'USD'},
        });

        const cardList: CardList = {
            '1': cardWithFraudNoReportID,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Card should be excluded because fraudAlertReportID is missing
        expect(result.cardsWithFraud).toHaveLength(0);
    });

    it('excludes fraud cards that have possibleFraud with fraudAlertReportID of 0', () => {
        const cardWithFraudZeroReportID = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 5000, triggerMerchant: 'Test Merchant', currency: 'USD', fraudAlertReportID: 0},
        });

        const cardList: CardList = {
            '1': cardWithFraudZeroReportID,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Card should be excluded because fraudAlertReportID is 0 (falsy)
        expect(result.cardsWithFraud).toHaveLength(0);
    });

    it('only includes fraud cards with complete data for rendering when mixed with incomplete ones', () => {
        // Card with complete fraud data (should be included)
        const completeCard = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 5000, triggerMerchant: 'Store A', currency: 'USD', fraudAlertReportID: 123},
        });

        // Card with fraud flag but no possibleFraud (should be excluded)
        const incompleteFraudFlag = createRandomExpensifyCard(2, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL,
        });

        // Card with possibleFraud but missing fraudAlertReportID (should be excluded)
        const incompletePossibleFraud = createRandomExpensifyCard(3, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
            possibleFraud: {triggerAmount: 3000, triggerMerchant: 'Store B', currency: 'USD'},
        });

        const cardList: CardList = {
            '1': completeCard,
            '2': incompleteFraudFlag,
            '3': incompletePossibleFraud,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // Only the card with complete data should be included
        expect(result.cardsWithFraud).toHaveLength(1);
        expect(result.cardsWithFraud.at(0)?.cardID).toBe(1);
    });

    it('returns completely empty result when only fraud cards exist but none have sufficient data to render', () => {
        // This is the scenario that would cause an empty "Time sensitive" section
        const cardWithFraudFlagOnly = createRandomExpensifyCard(1, {
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN,
        });

        const cardList: CardList = {
            '1': cardWithFraudFlagOnly,
        };

        const result = timeSensitiveCardsSelector(cardList);

        // All arrays should be empty, ensuring hasAnyTimeSensitiveContent would be false
        expect(result.cardsWithFraud).toHaveLength(0);
        expect(result.cardsNeedingShippingAddress).toHaveLength(0);
        expect(result.cardsNeedingActivation).toHaveLength(0);
    });
});

describe('areAllExpensifyCardsShipped', () => {
    it('returns true when cardList is undefined or empty', () => {
        expect(areAllExpensifyCardsShipped(undefined)).toBe(true);
        expect(areAllExpensifyCardsShipped({})).toBe(true);
    });

    it('returns true when all Expensify cards are shipped (not STATE_NOT_ISSUED)', () => {
        const cardList: CardList = {
            '1': createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED}),
            '2': createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN}),
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(true);
    });

    it('returns false when any Expensify card is in STATE_NOT_ISSUED', () => {
        const cardList: CardList = {
            '1': createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN}),
            '2': createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED}),
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(false);
    });

    // CRITICAL: This test ensures the personal cards should not affect the result
    it('returns true when Expensify cards are shipped even if user has personal cards', () => {
        const personalCard = createRandomCard(1, {bank: CONST.PERSONAL_CARD.BANK_NAME.CSV});
        const expensifyCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});

        const cardList: CardList = {
            '1': personalCard,
            '2': expensifyCard,
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(true);
    });

    // CRITICAL: This test ensures the company cards should not affect the result
    it('returns true when Expensify cards are shipped even if user has company cards', () => {
        const companyCard = createRandomCompanyCard(1, {bank: 'vcf'});
        const expensifyCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

        const cardList: CardList = {
            '1': companyCard,
            '2': expensifyCard,
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(true);
    });

    it('ignores invalid card entries (missing cardID or bank)', () => {
        const validCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const invalidCard = {cardID: 2} as Card; // Missing bank

        const cardList: CardList = {
            '1': validCard,
            '2': invalidCard,
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(true);
    });

    it('returns true when only non-Expensify cards exist', () => {
        const cardList: CardList = {
            '1': createRandomCompanyCard(1, {bank: 'vcf'}),
            '2': createRandomCard(2, {bank: CONST.PERSONAL_CARD.BANK_NAME.CSV}),
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(true);
    });

    it('returns false when mixing shipped and unshipped Expensify cards with other card types', () => {
        const companyCard = createRandomCompanyCard(1, {bank: 'vcf'});
        const shippedExpensifyCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const unshippedExpensifyCard = createRandomExpensifyCard(3, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});

        const cardList: CardList = {
            '1': companyCard,
            '2': shippedExpensifyCard,
            '3': unshippedExpensifyCard,
        };
        expect(areAllExpensifyCardsShipped(cardList)).toBe(false);
    });
});

describe('filterOutPersonalCards', () => {
    it('should return only cards with a valid fundID', () => {
        const cardList: CardList = {
            '1': {
                cardID: 1,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardName: 'Company Card 1',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '1111',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
                fundID: '100',
            },
            '2': {
                cardID: 2,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardName: 'Personal Card',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '2222',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
                // No fundID - personal card
            },
            '3': {
                cardID: 3,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
                cardName: 'Company Card 2',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '3333',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
                fundID: '200',
            },
        };

        const result = filterOutPersonalCards(cardList);
        const cardIDs = Object.keys(result);

        expect(cardIDs).toHaveLength(2);
        expect(cardIDs).toContain('1');
        expect(cardIDs).toContain('3');
        expect(cardIDs).not.toContain('2');
    });

    it('should filter out cards with fundID of "0"', () => {
        const cardList: CardList = {
            '1': {
                cardID: 1,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardName: 'Card with fundID 0',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '1111',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
                fundID: '0',
            },
            '2': {
                cardID: 2,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardName: 'Card with valid fundID',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '2222',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
                fundID: '123',
            },
        };

        const result = filterOutPersonalCards(cardList);
        const cardIDs = Object.keys(result);

        expect(cardIDs).toHaveLength(1);
        expect(cardIDs).toContain('2');
        expect(cardIDs).not.toContain('1');
    });

    it('should return empty object for undefined card list', () => {
        const result = filterOutPersonalCards(undefined);
        expect(result).toEqual({});
    });

    it('should return empty object when no cards have fundID', () => {
        const cardList: CardList = {
            '1': {
                cardID: 1,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardName: 'Personal Card 1',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '1111',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
            },
            '2': {
                cardID: 2,
                accountID: 12345,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
                cardName: 'Personal Card 2',
                domainName: '',
                fraud: 'none',
                lastFourPAN: '2222',
                lastScrape: '',
                lastUpdated: '',
                state: 3,
            },
        };

        const result = filterOutPersonalCards(cardList);
        expect(Object.keys(result)).toHaveLength(0);
    });

    it('should handle empty card list', () => {
        const result = filterOutPersonalCards({});
        expect(result).toEqual({});
    });
});
