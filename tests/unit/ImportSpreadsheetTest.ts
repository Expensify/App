import {applyCompanyCardSavedColumnMappings, setSpreadsheetData} from '@libs/actions/ImportSpreadsheet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';

import Onyx from 'react-native-onyx';

/**
 * Builds a sparse row, mirroring what `XLSX.utils.sheet_to_json(worksheet, {header: 1})` returns for a sheet with a
 * blank column: the missing cell is left as an array *hole*, not as `undefined`.
 */
function buildSparseRow(cells: string[], holeIndexes: number[]): string[] {
    const row = new Array<string>(cells.length);
    for (const [index, cell] of cells.entries()) {
        if (holeIndexes.includes(index)) {
            continue;
        }
        row[index] = cell;
    }
    return row;
}

function isImportedSpreadsheet(value: unknown): value is ImportedSpreadsheet {
    return typeof value === 'object' && !!value && 'data' in value;
}

function hasColumnMappings(value: unknown): value is {columns: Record<number, string>} {
    return typeof value === 'object' && !!value && 'columns' in value;
}

/** Replays the column-major to row-major transpose the company cards import runs when Import is pressed. */
function transposeBackToRows(columns: string[][]): string[][] {
    const rows: string[][] = [];
    for (let rowIndex = 0; rowIndex < (columns.at(0)?.length ?? 0); rowIndex++) {
        const row: string[] = [];
        for (const column of columns) {
            row.push(column.at(rowIndex) ?? '');
        }
        rows.push(row);
    }
    return rows;
}

describe('ImportSpreadsheet', () => {
    describe('setSpreadsheetData', () => {
        let storedSpreadsheet: ImportedSpreadsheet | undefined;

        beforeEach(() => {
            storedSpreadsheet = undefined;
            jest.spyOn(Onyx, 'set').mockImplementation((key, value) => {
                if (key === ONYXKEYS.IMPORTED_SPREADSHEET && isImportedSpreadsheet(value)) {
                    storedSpreadsheet = value;
                }
                return Promise.resolve();
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        async function importData(data: string[][]) {
            await setSpreadsheetData(data, 'file://spreadsheet.csv', 'text/csv', 'spreadsheet.csv', false);
            expect(storedSpreadsheet).toBeDefined();
            return storedSpreadsheet;
        }

        it('transposes dense data to column-major format', async () => {
            const spreadsheet = await importData([
                ['Date', 'Merchant', 'Amount'],
                ['2026-07-21', 'Starbucks', '10'],
                ['2026-07-22', 'Amazon', '20'],
            ]);

            expect(spreadsheet?.data).toEqual([
                ['Date', '2026-07-21', '2026-07-22'],
                ['Merchant', 'Starbucks', 'Amazon'],
                ['Amount', '10', '20'],
            ]);
            expect(Object.values(spreadsheet?.columns ?? {})).toEqual([CONST.CSV_IMPORT_COLUMNS.IGNORE, CONST.CSV_IMPORT_COLUMNS.IGNORE, CONST.CSV_IMPORT_COLUMNS.IGNORE]);
        });

        it('produces a dense column for a blank column in the header row', async () => {
            const spreadsheet = await importData([buildSparseRow(['Date', '', 'Amount'], [1]), buildSparseRow(['2026-07-21', '', '10'], [1])]);

            expect(spreadsheet?.data).toEqual([
                ['Date', '2026-07-21'],
                ['', ''],
                ['Amount', '10'],
            ]);
            // Object.keys skips array holes, so this only matches the length when every index holds a real column
            expect(Object.keys(spreadsheet?.data ?? []).length).toBe(spreadsheet?.data?.length);
        });

        it('keeps the column count in sync with the generated column roles', async () => {
            const spreadsheet = await importData([buildSparseRow(['Date', '', '', 'Amount'], [1, 2]), buildSparseRow(['2026-07-21', '', '', '10'], [1, 2])]);

            expect(spreadsheet?.data?.length).toBe(4);
            expect(Object.keys(spreadsheet?.data ?? []).length).toBe(4);
            expect(Object.keys(spreadsheet?.columns ?? {}).length).toBe(4);
        });

        it('lets the company cards import transpose the data back without throwing', async () => {
            const spreadsheet = await importData([buildSparseRow(['Date', '', 'Amount'], [1]), buildSparseRow(['2026-07-21', '', '10'], [1]), buildSparseRow(['2026-07-22', '', '20'], [1])]);

            expect(transposeBackToRows(spreadsheet?.data ?? [])).toEqual([
                ['Date', '', 'Amount'],
                ['2026-07-21', '', '10'],
                ['2026-07-22', '', '20'],
            ]);
        });

        it('pads ragged rows so every column has one cell per row', async () => {
            const spreadsheet = await importData([
                ['Date', 'Merchant', 'Amount'],
                ['2026-07-21', 'Starbucks'],
            ]);

            expect(spreadsheet?.data).toEqual([
                ['Date', '2026-07-21'],
                ['Merchant', 'Starbucks'],
                ['Amount', ''],
            ]);
        });

        it('rejects data that does not have at least a header and one row', async () => {
            await expect(setSpreadsheetData([['Date', 'Amount']], 'file://spreadsheet.csv', 'text/csv', 'spreadsheet.csv', false)).rejects.toThrow(
                'Invalid data format: file must contain at least 2 rows',
            );
            expect(storedSpreadsheet).toBeUndefined();
        });
    });

    describe('applyCompanyCardSavedColumnMappings', () => {
        let mergedColumns: Record<number, string> | undefined;

        beforeEach(() => {
            mergedColumns = undefined;
            jest.spyOn(Onyx, 'merge').mockImplementation((key, value) => {
                if (key === ONYXKEYS.IMPORTED_SPREADSHEET && hasColumnMappings(value)) {
                    mergedColumns = value.columns;
                }
                return Promise.resolve();
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        const spreadsheetColumns = [
            ['Card', '1234'],
            ['Date', '2024-01-15'],
            ['Merchant', 'Coffee Shop'],
            ['Amount', '-5.00'],
            ['Currency', 'USD'],
            ['Notes', 'Team offsite'],
        ];
        const availableRoles = [
            CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
            CONST.CSV_IMPORT_COLUMNS.POSTED_DATE,
            CONST.CSV_IMPORT_COLUMNS.MERCHANT,
            CONST.CSV_IMPORT_COLUMNS.AMOUNT,
            CONST.CSV_IMPORT_COLUMNS.CURRENCY,
            CONST.CSV_IMPORT_COLUMNS.EXTERNAL_ID,
        ];

        it('restores the saved mappings for regular roles', () => {
            applyCompanyCardSavedColumnMappings(spreadsheetColumns, {cardNumber: '0', postedDate: '1', merchant: '2'}, availableRoles);

            // Asserted as entries because integer-like object keys trip the naming-convention lint rule.
            expect(Object.entries(mergedColumns ?? {})).toEqual([
                ['0', CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER],
                ['1', CONST.CSV_IMPORT_COLUMNS.POSTED_DATE],
                ['2', CONST.CSV_IMPORT_COLUMNS.MERCHANT],
            ]);
        });

        it('never restores a saved externalID mapping, which can point at the synthetic column rather than a real one', () => {
            applyCompanyCardSavedColumnMappings(spreadsheetColumns, {cardNumber: '0', externalID: '5'}, availableRoles);

            expect(Object.entries(mergedColumns ?? {})).toEqual([['0', CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER]]);
        });
    });
});
