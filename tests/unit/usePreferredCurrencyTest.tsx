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
        // Given a local currency that is a valid payment card currency, and no billing card to override it
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: CONST.PAYMENT_CARD_CURRENCY.GBP}});
            await waitForBatchedUpdates();
        });
        // When a screen asks for the preferred currency
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then the local currency is used, so prices match what the user can pay in
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.GBP);
    });
    it('rejects an unsupported local currency', async () => {
        // Given a local currency that cannot be used for card payments, so prices cannot be shown in it
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: 'JPY'}});
            await waitForBatchedUpdates();
        });
        // When a screen asks for the preferred currency
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then USD is returned, so callers never receive a currency outside the payment card list
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.USD);
    });
    it('defaults to USD when the local currency is absent', async () => {
        // Given no local currency data, so there is no user preference to apply
        // When a screen asks for the preferred currency
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then USD is returned, so callers always have a currency for showing prices
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.USD);
    });
    it('prefers the billing card to the local currency', async () => {
        // Given a billing card in a different currency from the local one, so the two preferences conflict
        const fundList: FundList = {billingCard: {accountData: {currency: CONST.PAYMENT_CARD_CURRENCY.EUR, additionalData: {isBillingCard: true}}}};
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, localCurrencyCode: CONST.PAYMENT_CARD_CURRENCY.GBP}});
            await Onyx.set(ONYXKEYS.FUND_LIST, fundList);
            await waitForBatchedUpdates();
        });
        // When a screen asks for the preferred currency
        const {result} = renderHook(usePreferredCurrency);
        await waitForBatchedUpdatesWithAct();
        // Then the billing card currency wins, because it is the first choice in the preference order
        expect(result.current).toBe(CONST.PAYMENT_CARD_CURRENCY.EUR);
    });
});
