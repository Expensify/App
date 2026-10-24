import getMoneyRequestViewFields from '@libs/getMoneyRequestViewFields';

import CONST from '@src/CONST';

describe('getMoneyRequestViewFields', () => {
    it('preserves the default editors when another expense adds report columns', () => {
        // Given a report where other expenses have accounting or conversion information, without a saved preference.
        const columns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];

        // When its table columns are shown as expense fields.
        const fields = getMoneyRequestViewFields(columns);

        // Then existing editors keep their order without adding empty rows for this expense.
        expect(fields).toEqual([
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
            CONST.SEARCH.TABLE_COLUMNS.VENDOR,
            CONST.SEARCH.TABLE_COLUMNS.TAG,
            CONST.SEARCH.TABLE_COLUMNS.CARD,
            CONST.SEARCH.TABLE_COLUMNS.TAX_RATE,
            CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
            CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE,
            CONST.SEARCH.TABLE_COLUMNS.BILLABLE,
        ]);
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

    it('omits columns whose values already appear in an expense editor', () => {
        // Given a report table that selects both expense editors and their supporting values as separate columns.
        const columns = [
            CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
            CONST.SEARCH.TABLE_COLUMNS.POSTED,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ];

        // When the saved table columns are displayed in the expense view.
        const fields = getMoneyRequestViewFields(columns, true);

        // Then each editor appears once because Amount, Attendees and Date already include those details.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.ATTENDEES]);
    });

    it.each([
        [CONST.SEARCH.TABLE_COLUMNS.POSTED, CONST.SEARCH.TABLE_COLUMNS.DATE],
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, CONST.SEARCH.TABLE_COLUMNS.ATTENDEES],
    ] as const)('preserves the data selected through %s when its editor is omitted', (column, editor) => {
        // Given a supporting column selected without the expense editor that displays its value.
        const columns = [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, column, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, column];

        // When the saved columns are mapped to expense fields.
        const fields = getMoneyRequestViewFields(columns, true);

        // Then the matching editor appears once in the supporting column's saved position.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, editor, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });

    it.each([
        [CONST.SEARCH.TABLE_COLUMNS.POSTED, CONST.SEARCH.TABLE_COLUMNS.DATE],
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, CONST.SEARCH.TABLE_COLUMNS.ATTENDEES],
    ] as const)('preserves an explicit editor selection alongside %s', (column, editor) => {
        // Given an explicitly ordered editor followed by its supporting column and duplicate selections.
        const columns = [editor, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, column, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, editor, column];

        // When the saved columns are mapped to expense fields.
        const fields = getMoneyRequestViewFields(columns, true);

        // Then the explicit editor keeps its position without adding another row for the supporting column.
        expect(fields).toEqual([editor, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });
});
