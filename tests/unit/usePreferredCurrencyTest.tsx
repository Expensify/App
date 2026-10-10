import {act, cleanup, renderHook} from '@testing-library/react-native';

import usePreferredCurrency from '@hooks/usePreferredCurrency';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FundList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ACCOUNT_ID = 123;

describe('usePreferredCurrency', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
            await waitForBatchedUpdates();
        });
    });
    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });
    it('uses a supported local currency', async () => {
        // Given a user with a supported non-USD local currency
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: CONST.PAYMENT_CARD_CURRENCY.GBP}});
            await waitForBatchedUpdates();
        });
        // When the production preference hook reads Onyx
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then it returns the supported local currency
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.GBP);
    });
    it('rejects an unsupported local currency', async () => {
        // Given a user whose local currency cannot be used for card payments
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: 'JPY'}});
            await waitForBatchedUpdates();
        });
        // When the production preference hook reads Onyx
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then it falls back to USD
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.USD);
    });
    it('defaults to USD when the local currency is absent', async () => {
        // Given a session without local currency data
        // When the production preference hook reads Onyx
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then it defaults to USD
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.USD);
    });
    it('prefers the billing card to the local currency', async () => {
        // Given a local currency and a billing card with a different currency
        const fundList: FundList = {billingCard: {accountData: {currency: CONST.PAYMENT_CARD_CURRENCY.EUR, additionalData: {isBillingCard: true}}}};
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: CONST.PAYMENT_CARD_CURRENCY.GBP}});
            await Onyx.set(ONYXKEYS.FUND_LIST, fundList);
            await waitForBatchedUpdates();
        });
        // When the production preference hook reads Onyx
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then the billing card wins
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.EUR);
    });
});
