/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTimeSensitiveCards from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import {createRandomExpensifyCard} from '../../utils/collections/card';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useTimeSensitiveCards', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should return empty arrays when no cards exist', () => {
        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsNeedingShippingAddress).toEqual([]);
        expect(result.current.cardsNeedingActivation).toEqual([]);
        expect(result.current.cardsWithFraud).toEqual([]);
        expect(result.current.shouldShowAddShippingAddress).toBe(false);
        expect(result.current.shouldShowActivateCard).toBe(false);
        expect(result.current.shouldShowReviewCardFraud).toBe(false);
    });

    it('should return empty arrays when no cards need action', async () => {
        const openCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const cardList: CardList = {'1': openCard};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsNeedingShippingAddress).toEqual([]);
        expect(result.current.cardsNeedingActivation).toEqual([]);
        expect(result.current.shouldShowAddShippingAddress).toBe(false);
        expect(result.current.shouldShowActivateCard).toBe(false);
    });

    it('should identify cards needing shipping address and set shouldShowAddShippingAddress to true', async () => {
        const cardNeedingShipping = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const cardList: CardList = {'1': cardNeedingShipping};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.current.cardsNeedingShippingAddress[0].cardID).toBe(1);
        expect(result.current.shouldShowAddShippingAddress).toBe(true);
        expect(result.current.shouldShowActivateCard).toBe(false);
    });

    it('should identify cards needing activation and set shouldShowActivateCard to true', async () => {
        const cardNeedingActivation = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        const cardList: CardList = {'1': cardNeedingActivation};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsNeedingActivation).toHaveLength(1);
        expect(result.current.cardsNeedingActivation[0].cardID).toBe(1);
        expect(result.current.shouldShowActivateCard).toBe(true);
        expect(result.current.shouldShowAddShippingAddress).toBe(false);
    });

    it('should handle multiple cards needing different actions', async () => {
        const cardNeedingShipping = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});
        const cardNeedingActivation = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        const openCard = createRandomExpensifyCard(3, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

        const cardList: CardList = {
            '1': cardNeedingShipping,
            '2': cardNeedingActivation,
            '3': openCard,
        };

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.current.cardsNeedingActivation).toHaveLength(1);
        expect(result.current.shouldShowAddShippingAddress).toBe(true);
        expect(result.current.shouldShowActivateCard).toBe(true);
    });

    it('should exclude virtual cards from time-sensitive results', async () => {
        const virtualCard: Card = {
            ...createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED}),
            nameValuePairs: {isVirtual: true} as Card['nameValuePairs'],
        };
        const physicalCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});

        const cardList: CardList = {
            '1': virtualCard,
            '2': physicalCard,
        };

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        // Only physical card should be included
        expect(result.current.cardsNeedingActivation).toHaveLength(1);
        expect(result.current.cardsNeedingActivation[0].cardID).toBe(2);
    });

    it('should exclude non-Expensify cards from time-sensitive results', async () => {
        // Company card with pending state
        const companyCard: Card = {
            cardID: 1,
            bank: 'vcf',
            state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            lastUpdated: '2024-01-01',
        } as Card;

        const expensifyCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED});

        const cardList: CardList = {
            '1': companyCard,
            '2': expensifyCard,
        };

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        // Only Expensify card should be included
        expect(result.current.cardsNeedingShippingAddress).toHaveLength(1);
        expect(result.current.cardsNeedingShippingAddress[0].cardID).toBe(2);
    });

    it('should update when card list changes', async () => {
        const openCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const cardList: CardList = {'1': openCard};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result, rerender} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.shouldShowActivateCard).toBe(false);

        // Add a card needing activation
        const cardNeedingActivation = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED});
        await Onyx.merge(ONYXKEYS.CARD_LIST, {'2': cardNeedingActivation});
        await waitForBatchedUpdates();

        rerender({});

        expect(result.current.cardsNeedingActivation).toHaveLength(1);
        expect(result.current.shouldShowActivateCard).toBe(true);
    });

    it('should identify cards with fraud and set shouldShowReviewCardFraud to true', async () => {
        const cardWithFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN});
        const cardList: CardList = {'1': cardWithFraud};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsWithFraud).toHaveLength(1);
        expect(result.current.cardsWithFraud[0].cardID).toBe(1);
        expect(result.current.shouldShowReviewCardFraud).toBe(true);
    });

    it('should not show fraud review for cards with fraud type NONE', async () => {
        const cardWithNoFraud = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN, fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE});
        const cardList: CardList = {'1': cardWithNoFraud};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveCards());

        expect(result.current.cardsWithFraud).toHaveLength(0);
        expect(result.current.shouldShowReviewCardFraud).toBe(false);
    });
});
