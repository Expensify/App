import getNextMoneyRequestReportSortConfig from '@libs/getNextMoneyRequestReportSortConfig';

import CONST from '@src/CONST';

describe('getNextMoneyRequestReportSortConfig', () => {
    const date = CONST.SEARCH.TABLE_COLUMNS.DATE;
    const total = CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT;
    const asc = CONST.SEARCH.SORT_ORDER.ASC;
    const desc = CONST.SEARCH.SORT_ORDER.DESC;

    it('restores Date/ASC when returning to Date from Total (even if header sends DESC)', () => {
        const next = getNextMoneyRequestReportSortConfig({sortBy: total, sortOrder: desc}, date, desc);
        expect(next).toEqual({sortBy: date, sortOrder: asc});
    });

    it('preserves ASC↔DESC toggle while Date is already active', () => {
        expect(getNextMoneyRequestReportSortConfig({sortBy: date, sortOrder: asc}, date, desc)).toEqual({sortBy: date, sortOrder: desc});
        expect(getNextMoneyRequestReportSortConfig({sortBy: date, sortOrder: desc}, date, asc)).toEqual({sortBy: date, sortOrder: asc});
    });

    it('passes through Total column selections unchanged', () => {
        const next = getNextMoneyRequestReportSortConfig({sortBy: date, sortOrder: asc}, total, desc);
        expect(next).toEqual({sortBy: total, sortOrder: desc});
    });
});
