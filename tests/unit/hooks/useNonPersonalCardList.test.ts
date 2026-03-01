/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import {createRandomExpensifyCard} from '../../utils/collections/card';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useNonPersonalCardList', () => {
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

    it('should return empty object when no cards exist', () => {
        const {result} = renderHook(() => useNonPersonalCardList());

        expect(result.current).toEqual({});
    });

    it('should return empty object when only personal cards exist', async () => {
        const personalCard: Card = {cardID: 1, bank: CONST.PERSONAL_CARD.BANK_NAME.CSV, lastUpdated: ''} as Card;
        const cardList: CardList = {'1': personalCard};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useNonPersonalCardList());

        expect(Object.keys(result.current)).toHaveLength(0);
    });

    it('should return Expensify cards and filter out personal cards', async () => {
        const expensifyCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const personalCard: Card = {cardID: 2, bank: CONST.PERSONAL_CARD.BANK_NAME.CSV, lastUpdated: ''} as Card;
        const cardList: CardList = {'1': expensifyCard, '2': personalCard};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useNonPersonalCardList());

        expect(Object.keys(result.current)).toHaveLength(1);
        expect(result.current['1']?.cardID).toBe(1);
        expect(result.current['2']).toBeUndefined();
    });

    it('should return company cards and filter out personal cards', async () => {
        // createRandomCard always sets fundID to undefined for non-Expensify banks,
        // so we construct company cards directly with a fundID to avoid personal card filtering
        const companyCard: Card = {
            cardID: 1,
            bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            fundID: '100',
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            lastUpdated: '',
            domainName: '',
            lastFourPAN: '1111',
        } as Card;
        const personalCard: Card = {cardID: 2, bank: CONST.PERSONAL_CARD.BANK_NAME.CSV, lastUpdated: ''} as Card;
        const cardList: CardList = {'1': companyCard, '2': personalCard};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useNonPersonalCardList());

        expect(Object.keys(result.current)).toHaveLength(1);
        expect(result.current['1']?.cardID).toBe(1);
        expect(result.current['2']).toBeUndefined();
    });

    it('should return all non-personal cards when no personal cards exist', async () => {
        const expensifyCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        const companyCard: Card = {
            cardID: 2,
            bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            fundID: '200',
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            lastUpdated: '',
            domainName: '',
            lastFourPAN: '2222',
        } as Card;
        const cardList: CardList = {'1': expensifyCard, '2': companyCard};

        await Onyx.merge(ONYXKEYS.CARD_LIST, cardList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useNonPersonalCardList());

        expect(Object.keys(result.current)).toHaveLength(2);
        expect(result.current['1']?.cardID).toBe(1);
        expect(result.current['2']?.cardID).toBe(2);
    });

    it('should update when card list changes', async () => {
        const expensifyCard = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});
        await Onyx.merge(ONYXKEYS.CARD_LIST, {'1': expensifyCard});
        await waitForBatchedUpdates();

        const {result, rerender} = renderHook(() => useNonPersonalCardList());
        expect(Object.keys(result.current)).toHaveLength(1);

        const companyCard: Card = {
            cardID: 2,
            bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            fundID: '300',
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            lastUpdated: '',
            domainName: '',
            lastFourPAN: '3333',
        } as Card;
        await Onyx.merge(ONYXKEYS.CARD_LIST, {'2': companyCard});
        await waitForBatchedUpdates();

        rerender({});
        expect(Object.keys(result.current)).toHaveLength(2);
    });
});
