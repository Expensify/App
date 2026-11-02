import {WRITE_COMMANDS} from '@libs/API/types';

import {clearBulkAction} from '@userActions/BulkAction';

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
});
