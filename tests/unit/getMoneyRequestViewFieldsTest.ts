import getMoneyRequestViewFields from '@libs/getMoneyRequestViewFields';

import CONST from '@src/CONST';

describe('getMoneyRequestViewFields', () => {
    it('preserves existing editors alongside explicitly configured report columns', () => {
        // Given a table preference that omits most expense editors but includes accounting information.
        const columns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];
        const defaultFields = getMoneyRequestViewFields();

        // When the expense has not yet been customized.
        const fields = getMoneyRequestViewFields(columns);

        // Then the report's additional information follows the existing editors without hiding them.
        expect(fields).toEqual([...defaultFields, CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE]);
    });

    it('honors custom order without treating the receipt panel and table controls as fields', () => {
        // Given saved expense fields with receipt and comments alongside expense data.
        const columns = [
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.TYPE,
            CONST.SEARCH.TABLE_COLUMNS.MCC,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE,
        ];

        // When the expense selection is reloaded independently of the table selection.
        const fields = getMoneyRequestViewFields([CONST.SEARCH.TABLE_COLUMNS.MERCHANT], JSON.stringify(columns));

        // Then only selectable data fields render, in the saved order.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]);
    });

    it('keeps amount accessible when an old preference omits the required column', () => {
        // Given a preference saved before amount was mandatory.
        const columns = [CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE];

        // When it is loaded by the expense editor.
        const fields = getMoneyRequestViewFields([], JSON.stringify(columns));

        // Then the expense still has its amount editor and the requested accounting field.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]);
    });

    it('omits columns whose values already appear in an expense editor', () => {
        // Given a stored expense selection containing table aliases and duplicate values.
        const columns = [
            CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL,
            CONST.SEARCH.TABLE_COLUMNS.HELD,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
            CONST.SEARCH.TABLE_COLUMNS.POSTED,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        ];

        // When those fields are restored in the expense view.
        const fields = getMoneyRequestViewFields([], JSON.stringify(columns));

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
        const fields = getMoneyRequestViewFields([], JSON.stringify(columns));

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
        const fields = getMoneyRequestViewFields([], JSON.stringify(columns));

        // Then the explicit editor keeps its position without adding another row for the supporting column.
        expect(fields).toEqual([editor, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });

    it('keeps the established expense layout when no preferences exist', () => {
        // Given an account without table or expense preferences.
        // When its expense fields or field picker are opened.
        const fields = getMoneyRequestViewFields();

        // Then the editors that were available before customization remain available in their original order.
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

    it('does not reselect fields from the table after an expense customization', () => {
        // Given an expense preference that intentionally hides every optional field.
        const savedFields = JSON.stringify([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
        const tableColumns = [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION, CONST.SEARCH.TABLE_COLUMNS.MCC, CONST.SEARCH.TABLE_COLUMNS.ATTENDEES];

        // When the saved expense selection is restored alongside unrelated table choices.
        const fields = getMoneyRequestViewFields(tableColumns, savedFields);

        // Then the expense retains its own selection rather than inheriting default or table fields again.
        expect(fields).toEqual([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    });

    it.each([undefined, null, '', '{', '{}', 'null', '[]', '["unknown"]', '[null,42,true]'])('restores usable fields for preference %s', (savedFields) => {
        // Given a missing, corrupted or obsolete expense preference alongside a valid report field.
        const tableColumns = [CONST.SEARCH.TABLE_COLUMNS.MCC];

        // When the editor attempts to restore that preference.
        const fields = getMoneyRequestViewFields(tableColumns, savedFields);

        // Then malformed storage cannot remove the existing editors or explicitly configured report information.
        expect(fields).toEqual([...getMoneyRequestViewFields(), CONST.SEARCH.TABLE_COLUMNS.MCC]);
    });
});
