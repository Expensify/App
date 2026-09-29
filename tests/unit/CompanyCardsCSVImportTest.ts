import {findColumnName} from '@components/ImportColumn';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getCompanyCardImportColumnRoles} from '@pages/workspace/companyCards/addNew/CompanyCardsImportedPage';
import {CSV_TEMPLATE_CONTENT, CSV_TEMPLATE_FILE_NAME} from '@pages/workspace/companyCards/addNew/ImportFromFileStep';

import CONST from '@src/CONST';

// The assertions only inspect each role's `value`, so a passthrough translate that echoes the path is enough.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const translate: LocaleContextProps['translate'] = (path, ...parameters) => String(path);
const columnRoles = getCompanyCardImportColumnRoles(translate);
const roleValues = columnRoles.map((role) => role.value);

describe('Company card CSV import column roles', () => {
    it('always exposes every mapping field, including the fields that used to be gated behind the advanced-fields toggle', () => {
        expect(roleValues).toEqual(
            expect.arrayContaining([
                CONST.CSV_IMPORT_COLUMNS.IGNORE,
                CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
                CONST.CSV_IMPORT_COLUMNS.CARD_NAME,
                CONST.CSV_IMPORT_COLUMNS.POSTED_DATE,
                CONST.CSV_IMPORT_COLUMNS.MERCHANT,
                CONST.CSV_IMPORT_COLUMNS.AMOUNT,
                CONST.CSV_IMPORT_COLUMNS.CURRENCY,
                // Previously "advanced" fields, now always visible:
                CONST.CSV_IMPORT_COLUMNS.ORIGINAL_TRANSACTION_DATE,
                CONST.CSV_IMPORT_COLUMNS.ORIGINAL_AMOUNT,
                CONST.CSV_IMPORT_COLUMNS.ORIGINAL_CURRENCY,
                CONST.CSV_IMPORT_COLUMNS.COMMENT,
                CONST.CSV_IMPORT_COLUMNS.CATEGORY,
                CONST.CSV_IMPORT_COLUMNS.TAG,
                // The Unique ID column the backend dedupes re-uploads on:
                CONST.CSV_IMPORT_COLUMNS.EXTERNAL_ID,
            ]),
        );
    });

    it('does not gate any field behind a flag (no duplicates and a single flat list)', () => {
        expect(new Set(roleValues).size).toBe(roleValues.length);
    });

    it('keeps the base transaction columns marked as required', () => {
        const requiredValues = columnRoles.filter((role) => role.isRequired).map((role) => role.value);
        expect(requiredValues).toEqual(
            expect.arrayContaining([CONST.CSV_IMPORT_COLUMNS.POSTED_DATE, CONST.CSV_IMPORT_COLUMNS.MERCHANT, CONST.CSV_IMPORT_COLUMNS.AMOUNT, CONST.CSV_IMPORT_COLUMNS.CURRENCY]),
        );
    });
});

describe('findColumnName auto-mapping for company card imports', () => {
    it.each([
        ['Category', CONST.CSV_IMPORT_COLUMNS.CATEGORY],
        ['category', CONST.CSV_IMPORT_COLUMNS.CATEGORY],
        ['Categories', CONST.CSV_IMPORT_COLUMNS.CATEGORY],
    ])('auto-maps the "%s" header to the Category role', (header, expected) => {
        expect(findColumnName(header, columnRoles)).toBe(expected);
    });

    it.each([
        ['Tag', CONST.CSV_IMPORT_COLUMNS.TAG],
        ['tag', CONST.CSV_IMPORT_COLUMNS.TAG],
        ['Tags', CONST.CSV_IMPORT_COLUMNS.TAG],
    ])('auto-maps the "%s" header to the Tag role', (header, expected) => {
        expect(findColumnName(header, columnRoles)).toBe(expected);
    });

    // The renamed fields (Purchase amount, Purchase currency, Description) and Original transaction date
    // have no auto-detect logic and must stay manual-select. Auto-detection matches raw header text,
    // not the display labels.
    it.each(['Purchase amount', 'Original amount', 'Purchase currency', 'Original currency', 'Original transaction date', 'Description'])(
        'leaves the "%s" header unmapped so it stays manual-select',
        (header) => {
            expect(findColumnName(header, columnRoles)).toBe('');
        },
    );
});

describe('Downloadable CSV template', () => {
    const rows = CSV_TEMPLATE_CONTENT.split('\n');
    const columnCount = rows.at(0)?.split(',').length ?? 0;

    it('is offered as a .csv file', () => {
        expect(CSV_TEMPLATE_FILE_NAME.endsWith('.csv')).toBe(true);
    });

    it('has a header row plus at least one example row', () => {
        expect(rows.length).toBeGreaterThan(1);
    });

    it('keeps a consistent column count across every row (accounting for quoted commas)', () => {
        // Split on commas that are not inside double quotes so amounts like "1,200.00" count as one field.
        const splitCsvRow = (row: string) => row.match(/(".*?"|[^,]*)(,|$)/g)?.slice(0, -1) ?? [];
        expect(columnCount).toBeGreaterThan(0);
        for (const row of rows) {
            expect(splitCsvRow(row).length).toBe(columnCount);
        }
    });
});
