import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

describe('expense field preference persistence', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it.each(['', JSON.stringify([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MERCHANT])])(
        'restores the previous expense preference %s after a failed save',
        async (previousFields) => {
            // Given independently configured table columns and a previous expense preference.
            const tableColumns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];
            const savedFields = JSON.stringify([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]);
            await Onyx.set(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS, tableColumns);
            await Onyx.set(ONYXKEYS.NVP_EXPENSE_FIELDS, previousFields);

            // When the expense selection is queued through the existing NVP action.
            setNameValuePair(ONYXKEYS.NVP_EXPENSE_FIELDS, savedFields, previousFields);
            const request = jest.mocked(API.write).mock.calls.at(-1);
            if (!request?.[2]) {
                throw new Error('Expected the preference request to include optimistic and failure updates');
            }
            const updates = request[2];
            await Onyx.update(updates.optimisticData ?? []);

            // Then the queued value remains JSON text and the table's selection stays independent.
            expect(request[0]).toBe(WRITE_COMMANDS.SET_NAME_VALUE_PAIR);
            expect(request[1]).toEqual({name: ONYXKEYS.NVP_EXPENSE_FIELDS, value: savedFields});
            await expect(getOnyxValue(ONYXKEYS.NVP_EXPENSE_FIELDS)).resolves.toBe(savedFields);
            await expect(getOnyxValue(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS)).resolves.toEqual(tableColumns);

            // When the queued request fails.
            await Onyx.update(updates.failureData ?? []);

            // Then the previous expense preference returns without changing the table's selection.
            await expect(getOnyxValue(ONYXKEYS.NVP_EXPENSE_FIELDS)).resolves.toBe(previousFields);
            await expect(getOnyxValue(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS)).resolves.toEqual(tableColumns);
        },
    );
});
