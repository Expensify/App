import {buildCategoriesFromSpreadsheet, parseCsvAmountValue, parseCsvReceiptValue} from '@libs/ImportCategoriesUtils';

import CONST from '@src/CONST';
import type {ImportedSpreadsheet, PolicyCategories} from '@src/types/onyx';

/**
 * Builds a spreadsheet from rows of cells. The imported spreadsheet stores its data by column,
 * so the rows are transposed the same way the import flow does it.
 */
function buildSpreadsheet(rows: string[][], columnRoles: string[]): ImportedSpreadsheet {
    return {
        data: columnRoles.map((_, columnIndex) => rows.map((row) => row.at(columnIndex) ?? '')),
        columns: Object.fromEntries(columnRoles.map((role, index) => [index, role])),
        containsHeader: true,
        isImportingMultiLevelTags: false,
        isImportingIndependentMultiLevelTags: false,
        isGLAdjacent: false,
    };
}

describe('ImportCategoriesUtils', () => {
    describe('parseCsvAmountValue', () => {
        it('reads amounts that use commas as thousands separators', () => {
            // Given amounts formatted the way Expensify Classic exports them
            // When they are parsed
            // Then the commas are treated as thousands separators instead of making the value invalid
            expect(parseCsvAmountValue('299,393.00')).toBe(29939300);
            expect(parseCsvAmountValue('1,000')).toBe(100000);
            expect(parseCsvAmountValue('1,234,567.89')).toBe(123456789);
        });

        it('still reads plain amounts', () => {
            // Given amounts without thousands separators
            // When they are parsed
            // Then they keep working as before
            expect(parseCsvAmountValue('50')).toBe(5000);
            expect(parseCsvAmountValue(' 75.25 ')).toBe(7525);
        });

        it('ignores values whose commas are not thousands separators', () => {
            // Given values that only look like numbers, such as a European decimal comma
            // When they are parsed
            // Then they are skipped instead of being misread as a different amount
            expect(parseCsvAmountValue('1,5')).toBeUndefined();
            expect(parseCsvAmountValue('1.234,56')).toBeUndefined();
            expect(parseCsvAmountValue('12,34,567')).toBeUndefined();
            expect(parseCsvAmountValue('')).toBeUndefined();
            expect(parseCsvAmountValue(undefined)).toBeUndefined();
        });
    });

    describe('parseCsvReceiptValue', () => {
        it('reads receipt amounts that use commas as thousands separators', () => {
            // Given a "Require receipts over" amount formatted the way Expensify Classic exports it
            // When it is parsed
            // Then the commas are treated as thousands separators
            expect(parseCsvReceiptValue('1,000.00')).toBe(100000);
        });

        it('keeps the keyword values', () => {
            // Given the keyword values that Expensify Classic uses for receipt rules
            // When they are parsed
            // Then they map to the same values as before
            expect(parseCsvReceiptValue('required')).toBe(0);
            expect(parseCsvReceiptValue('not_required')).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
            expect(parseCsvReceiptValue('default')).toBeUndefined();
        });
    });

    describe('buildCategoriesFromSpreadsheet', () => {
        const columnRoles = [CONST.CSV_IMPORT_COLUMNS.NAME, CONST.CSV_IMPORT_COLUMNS.ENABLED, CONST.CSV_IMPORT_COLUMNS.MAX_EXPENSE_AMOUNT, CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_RECEIPT];
        const classicExportRows = [
            ['Category', 'Enabled', 'Max Expense amount', 'Receipts Required'],
            ['Travel', 'TRUE', '299,393.00', '1,000.00'],
            ['Meals', 'TRUE', '299,393.00', '1,000.00'],
        ];

        it('imports the max expense amount from a Classic export row for new and existing categories', () => {
            // Given a Classic export where amounts use thousands separators, and a workspace that already has the Meals category with another limit
            const spreadsheet = buildSpreadsheet(classicExportRows, columnRoles);
            const policyCategories: PolicyCategories = {
                Meals: {name: 'Meals', enabled: true, maxExpenseAmount: 5000, maxAmountNoReceipt: 2500},
            };

            // When the categories are built from the spreadsheet
            const categories = buildCategoriesFromSpreadsheet(spreadsheet, policyCategories);

            // Then both the new Travel category and the existing Meals category get the exported limits instead of silently dropping them
            expect(categories).toStrictEqual([
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Travel', enabled: true, 'GL Code': '', maxExpenseAmount: 29939300, maxAmountNoReceipt: 100000},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Meals', enabled: true, 'GL Code': '', maxExpenseAmount: 29939300, maxAmountNoReceipt: 100000},
            ]);
        });
    });
});
