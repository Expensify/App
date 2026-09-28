import getMoneyRequestViewFields from '@libs/getMoneyRequestViewFields';

import CONST from '@src/CONST';

describe('getMoneyRequestViewFields', () => {
    it('keeps the default editor and adds automatically visible report data without duplicates', () => {
        // Given a report with conversion data but no saved column preference.
        const columns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];

        // When its table columns are shown as expense fields.
        const fields = getMoneyRequestViewFields(columns);

        // Then existing editors remain accessible and the missing conversion information appears once.
        expect(fields).toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
        expect(fields).toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);
        expect(fields.at(0)).toBe(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT);
        expect(fields.at(-1)).toBe(CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE);
        expect(fields.filter((column) => column === CONST.SEARCH.TABLE_COLUMNS.DATE)).toHaveLength(1);
    });

    it('honors custom order without treating the receipt panel and table controls as fields', () => {
        // Given a customized table with receipt and comments alongside expense data.
        const columns = [
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.TYPE,
            CONST.SEARCH.TABLE_COLUMNS.MCC,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE,
        ];

        // When the shared selection is rendered in the expense editor.
        const fields = getMoneyRequestViewFields(columns, true);

        // Then only selectable data fields render, in the saved order.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]);
    });

    it('keeps amount accessible when an old preference omits the required column', () => {
        // Given a preference saved before amount was mandatory.
        const columns = [CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE];

        // When it is loaded by the expense editor.
        const fields = getMoneyRequestViewFields(columns, true);

        // Then the expense still has its amount editor and the requested accounting field.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]);
    });
});
