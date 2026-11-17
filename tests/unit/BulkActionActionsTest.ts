import {WRITE_COMMANDS} from '@libs/API/types';

import {buildBulkActionOnyxData, clearBulkAction} from '@userActions/BulkAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

describe('BulkAction actions', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    test('clearBulkAction removes a failed bulk action without asking the backend', async () => {
        // Given a bulk action whose queue request failed, so the backend never kept it
        const onyxKey = `${ONYXKEYS.COLLECTION.BULK_ACTION}111` as const;
        const failedBulkAction = {state: CONST.BULK_ACTION.STATE.FAILED, action: CONST.SEARCH.BULK_ACTION_TYPES.PAY};
        await Onyx.set(onyxKey, failedBulkAction);

        // When the user closes it
        clearBulkAction('111', failedBulkAction);
        await waitForBatchedUpdates();

        // Then it's gone, and no ClearBulkAction request is sent that could fail and bring it back
        expect(await getOnyxValue(onyxKey)).toBeUndefined();
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CLEAR_BULK_ACTION, 0);
    });

    test('clearBulkAction asks the backend to clear a finished bulk action', async () => {
        // Given a finished bulk action the backend saved
        const onyxKey = `${ONYXKEYS.COLLECTION.BULK_ACTION}222` as const;
        const doneBulkAction = {state: CONST.BULK_ACTION.STATE.DONE, action: CONST.SEARCH.BULK_ACTION_TYPES.PAY, total: 2, failedReportIDs: []};
        await Onyx.set(onyxKey, doneBulkAction);

        // When the user closes it
        clearBulkAction('222', doneBulkAction);
        await waitForBatchedUpdates();

        // Then it's gone here and the backend is asked to drop it too
        expect(await getOnyxValue(onyxKey)).toBeUndefined();
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CLEAR_BULK_ACTION, 1);
    });

    test('buildBulkActionOnyxData keeps the payment type of a bank payment on the record', () => {
        // Given a bulk payment through a bank account
        // When its record is started
        const {onyxData} = buildBulkActionOnyxData(CONST.SEARCH.BULK_ACTION_TYPES.PAY, CONST.IOU.PAYMENT_TYPE.VBBA);

        // Then both the running and the failed record carry the payment type, so the modal reads as paid rather than marked as paid
        expect(onyxData.optimisticData.at(0)?.value).toEqual({state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.PAY, paymentType: CONST.IOU.PAYMENT_TYPE.VBBA});
        expect(onyxData.failureData.at(0)?.value).toEqual({state: CONST.BULK_ACTION.STATE.FAILED, action: CONST.SEARCH.BULK_ACTION_TYPES.PAY, paymentType: CONST.IOU.PAYMENT_TYPE.VBBA});
    });

    test('buildBulkActionOnyxData leaves the payment type off other bulk actions', () => {
        // Given a bulk approval, which has no payment type
        // When its record is started
        const {onyxData} = buildBulkActionOnyxData(CONST.SEARCH.BULK_ACTION_TYPES.APPROVE);

        // Then the record has no payment type at all, so it looks the same as before bank payments existed
        expect(onyxData.optimisticData.at(0)?.value).not.toHaveProperty('paymentType');
        expect(onyxData.failureData.at(0)?.value).not.toHaveProperty('paymentType');
    });
});
