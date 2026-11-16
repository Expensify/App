import {findColumnName} from '@components/ImportColumn';

import {getApproverColumnRole} from '@libs/importSpreadsheetUtils';

import CONST from '@src/CONST';

describe('findColumnName', () => {
    it('maps an "Updated vendor" header to the VENDOR role', () => {
        expect(findColumnName('Updated vendor')).toBe(CONST.CSV_IMPORT_COLUMNS.VENDOR);
    });

    it('maps an "Updated supplier" header to the VENDOR role, so a Xero-built template still auto-maps', () => {
        expect(findColumnName('Updated supplier')).toBe(CONST.CSV_IMPORT_COLUMNS.VENDOR);
    });

    it('maps "Tag", "Label" and "Labels" headers to the TAG role when Tag is a selectable column, matching Classic', () => {
        // Given an import that offers a Tag column, like the personal card transaction import
        const columnRoles = [
            {text: 'Ignore', value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: 'Tag', value: CONST.CSV_IMPORT_COLUMNS.TAG},
        ];

        // When the headers are auto-detected
        // Then each tag-like header maps to Tag so users moving from Classic don't have to map it by hand
        expect(findColumnName('Tag', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.TAG);
        expect(findColumnName('Label', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.TAG);
        expect(findColumnName('Labels', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.TAG);
    });

    it('leaves a "Label" header unmapped when Tag is not a selectable column', () => {
        // Given an import that doesn't offer a Tag column
        const columnRoles = [
            {text: 'Ignore', value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: 'Name', value: CONST.CSV_IMPORT_COLUMNS.NAME},
        ];

        // When a "Label" header is auto-detected
        // Then it stays unmapped instead of being picked up as another column
        expect(findColumnName('Label', columnRoles)).toBe('');
    });

    it('maps the Classic category export headers to the category import roles', () => {
        // Given the column roles offered by the categories import
        const columnRoles = [
            {text: 'Ignore', value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: 'Name', value: CONST.CSV_IMPORT_COLUMNS.NAME},
            {text: 'Payroll code', value: CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE},
            {text: 'Require itemized receipts over', value: CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT},
            {text: 'Require description', value: CONST.CSV_IMPORT_COLUMNS.ARE_COMMENTS_REQUIRED},
            {text: 'Description hint', value: CONST.CSV_IMPORT_COLUMNS.COMMENT_HINT},
            {text: 'Flag amounts over', value: CONST.CSV_IMPORT_COLUMNS.MAX_EXPENSE_AMOUNT},
            {text: 'Expense limit type', value: CONST.CSV_IMPORT_COLUMNS.EXPENSE_LIMIT_TYPE},
        ];

        // When the headers of a Classic category export are auto-detected
        // Then each one maps to its role so the admin doesn't have to map it by hand
        expect(findColumnName('Payroll Code', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE);
        expect(findColumnName('Payroll', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE);
        expect(findColumnName('Itemized Receipts Required', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT);
        expect(findColumnName('Comments', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.ARE_COMMENTS_REQUIRED);
        expect(findColumnName('Comment Hint', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.COMMENT_HINT);
        expect(findColumnName('Max Expense amount', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.MAX_EXPENSE_AMOUNT);
        expect(findColumnName('Expense Limit Type', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.EXPENSE_LIMIT_TYPE);
    });

    it('keeps mapping a "Payroll Code" header to CUSTOM_FIELD_2 in the members import', () => {
        // Given the members import, which offers CUSTOM_FIELD_2 but not PAYROLL_CODE
        const columnRoles = [
            {text: 'Ignore', value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: 'Payroll ID', value: CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_2},
        ];

        // When a "Payroll Code" header is auto-detected
        // Then it maps to the members-import payroll role
        expect(findColumnName('Payroll Code', columnRoles)).toBe(CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_2);
    });

    it("maps each approver's headers to that approver's columns when they are selectable", () => {
        // Given the members import offering the columns of the first two approvers
        const columnRoles = [
            {text: 'Ignore', value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            ...[1, 2].flatMap((position) => [
                {text: `Approver ${position}`, value: getApproverColumnRole(position, 'approver')},
                {text: `Approver ${position} limit`, value: getApproverColumnRole(position, 'approvalLimit')},
                {text: `Approver ${position} over limit approver`, value: getApproverColumnRole(position, 'overLimitApprover')},
            ]),
        ];

        // When the headers of an exported workflow are auto-detected
        // Then each one maps to its approver's column, whatever its casing and separators
        expect(findColumnName('Approver 1', columnRoles)).toBe(getApproverColumnRole(1, 'approver'));
        expect(findColumnName('Approver 2 limit', columnRoles)).toBe(getApproverColumnRole(2, 'approvalLimit'));
        expect(findColumnName('approver_2_over-limit approver', columnRoles)).toBe(getApproverColumnRole(2, 'overLimitApprover'));

        // And an approver whose columns aren't offered stays unmapped
        expect(findColumnName('Approver 3', columnRoles)).toBe('');
    });

    it('leaves the headers of approvers past the ones the import reads unmapped', () => {
        // Given headers for the last approver the import reads and the one after it
        const lastApprover = CONST.IMPORT_SPREADSHEET.MAX_APPROVERS;

        // When they are auto-detected
        // Then only the last approver the import reads gets a column
        expect(findColumnName(`Approver ${lastApprover}`)).toBe(getApproverColumnRole(lastApprover, 'approver'));
        expect(findColumnName(`Approver ${lastApprover + 1}`)).toBe('');
    });
});
