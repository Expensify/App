import Onyx from 'react-native-onyx';
import {clearErrorWithOriginalTransactionError} from '@libs/actions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ORIGINAL_ID = 'original1';
const CHILD_ID = 'child1';
const ERROR_KEY = '1';

function buildChild(): Partial<Transaction> {
    return {transactionID: CHILD_ID, reportID: CONST.REPORT.UNREPORTED_REPORT_ID, comment: {originalTransactionID: ORIGINAL_ID}, errors: {[ERROR_KEY]: 'child error'}};
}

describe('clearErrorWithOriginalTransactionError', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it("clears both the child's and the hidden container original's errors", async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${ORIGINAL_ID}`, {transactionID: ORIGINAL_ID, reportID: CONST.REPORT.SPLIT_REPORT_ID, errors: {[ERROR_KEY]: 'original error'}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${CHILD_ID}`, buildChild());
        await waitForBatchedUpdates();

        clearErrorWithOriginalTransactionError(CHILD_ID);
        await waitForBatchedUpdates();

        const child = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${CHILD_ID}`);
        const original = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${ORIGINAL_ID}`);
        expect(child?.errors).toBeFalsy();
        expect(original?.errors).toBeFalsy();
    });

    it('does not clear the original when it is no longer a split container (e.g. restored after a failed creation)', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${ORIGINAL_ID}`, {transactionID: ORIGINAL_ID, reportID: '987654', errors: {[ERROR_KEY]: 'original error'}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${CHILD_ID}`, buildChild());
        await waitForBatchedUpdates();

        clearErrorWithOriginalTransactionError(CHILD_ID);
        await waitForBatchedUpdates();

        const child = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${CHILD_ID}`);
        const original = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${ORIGINAL_ID}`);
        expect(child?.errors).toBeFalsy();
        expect(original?.errors).toEqual({[ERROR_KEY]: 'original error'});
    });

    it('clears only the transaction when it is not a split child', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${CHILD_ID}`, {transactionID: CHILD_ID, reportID: '987654', errors: {[ERROR_KEY]: 'some error'}});
        await waitForBatchedUpdates();

        clearErrorWithOriginalTransactionError(CHILD_ID);
        await waitForBatchedUpdates();

        const child = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${CHILD_ID}`);
        expect(child?.errors).toBeFalsy();
    });
});
