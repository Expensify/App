import {act, renderHook} from '@testing-library/react-native';

import useReportColumnEditing from '@components/MoneyRequestReportView/useReportColumnEditing';
import type {SearchColumnType} from '@components/Search/types';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/ReportLayout', () => ({setReportDetailsColumns: jest.fn()}));

const REPORT_ID = '1';

const SHOWN_COLUMNS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

describe('useReportColumnEditing', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(setReportDetailsColumns).mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('hides a column by saving the shown columns without it when nothing is saved yet', () => {
        // Given a report table showing its default columns, with no columns saved for the account
        const {result} = renderHook(() => useReportColumnEditing(REPORT_ID, SHOWN_COLUMNS));

        // When Merchant is hidden from its menu
        act(() => result.current.hideColumn(CONST.SEARCH.TABLE_COLUMNS.MERCHANT));

        // Then the account-wide columns are saved as the shown ones without Merchant, in the same order, so hiding
        // doesn't reorder the table
        expect(jest.mocked(setReportDetailsColumns)).toHaveBeenCalledWith(
            [
                CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
                CONST.SEARCH.TABLE_COLUMNS.DATE,
                CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
                CONST.SEARCH.TABLE_COLUMNS.TAG,
                CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            ],
            undefined,
        );
    });

    it('offers no hide for Amount when only Merchant and Amount are saved', async () => {
        // Given the account saved only Merchant and Amount for its report tables
        const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS, savedColumns);
        });
        const {result} = renderHook(() => useReportColumnEditing(REPORT_ID, savedColumns));
        await waitForBatchedUpdates();

        // When the column menus are built
        // Then Amount's menu can't hide it, since the table needs it to lay out, the same as the Columns page
        expect(result.current.hidableColumns.has(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)).toBe(false);
    });
});
