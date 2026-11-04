import {getTransactionDetails} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('getTransactionDetails created date', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    afterAll(() => IntlStore.load(CONST.LOCALES.DEFAULT));

    it.each([CONST.LOCALES.DE, CONST.LOCALES.JA])('keeps default transaction dates machine-readable in %s', async (locale) => {
        // Given a non-English active locale and an expense with an original calendar date
        await IntlStore.load(locale);
        const transaction = buildOptimisticTransaction({
            transactionParams: {amount: 1000, currency: 'USD', reportID: '1', comment: '', created: '2026-01-22'},
        });

        // When a display or API caller uses the default transaction-detail output before and after a date edit
        const original = getTransactionDetails(transaction);
        const modified = getTransactionDetails({...transaction, modifiedCreated: '2026-01-23'});

        // Then neither result contains localized month names, ordering or punctuation. The e-receipt formats this
        // yyyy-MM-dd value itself, and other callers send it to the API, so it must stay a machine date.
        expect(original?.created).toBe('2026-01-22');
        expect(modified?.created).toBe('2026-01-23');
        expect(transaction.created).toBe('2026-01-22');
    });
});
