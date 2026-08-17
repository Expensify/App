import {renderHook} from '@testing-library/react-native';

import useReportTransactionViolations from '@hooks/useReportTransactionViolations';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const IN_SCOPE_ID = 'txn1';
const OUT_OF_SCOPE_ID = 'txn2';

const violation: TransactionViolation = {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION};
const inScopeTransaction = {...createRandomTransaction(1), transactionID: IN_SCOPE_ID};

TestHelper.setupApp();

describe('useReportTransactionViolations', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${IN_SCOPE_ID}`, [violation]);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${OUT_OF_SCOPE_ID}`, [violation]);
        await waitForBatchedUpdatesWithAct();
    });

    it("narrows the violations collection to the given transactions' violations only", async () => {
        const {result} = renderHook(() => useReportTransactionViolations([inScopeTransaction]));
        await waitForBatchedUpdatesWithAct();

        const [violations] = result.current;
        expect(violations).toEqual({[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${IN_SCOPE_ID}`]: [violation]});
        expect(violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${OUT_OF_SCOPE_ID}`]).toBeUndefined();
    });

    it('returns an empty collection when no transactions are provided', async () => {
        const {result} = renderHook(() => useReportTransactionViolations([]));
        await waitForBatchedUpdatesWithAct();

        expect(result.current[0]).toEqual({});
    });
});
