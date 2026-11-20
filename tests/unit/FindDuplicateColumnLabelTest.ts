import {findDuplicateColumnLabel, getApproverColumnRole} from '@libs/importSpreadsheetUtils';

import CONST from '@src/CONST';
import fr from '@src/languages/fr';

describe('findDuplicateColumnLabel', () => {
    it.each([
        [CONST.CSV_IMPORT_COLUMNS.APPROVE_TO, 'Forward to'],
        [CONST.CSV_IMPORT_COLUMNS.REPORT_THRESHOLD, 'Approval limit'],
        [CONST.CSV_IMPORT_COLUMNS.APPROVE_TO_ALTERNATE, 'Over limit forward to'],
        [CONST.CSV_IMPORT_COLUMNS.GL_CODE, 'GL code'],
        [CONST.CSV_IMPORT_COLUMNS.POSTED_DATE, 'Date'],
        [CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_1, 'Employee ID'],
        [getApproverColumnRole(2, 'approvalLimit'), 'Approver 2 limit'],
        [CONST.CSV_IMPORT_COLUMNS.APPROVE_TO, fr.common.forwardTo],
    ])('resolves %s to the supplied display label %s', (value, text) => {
        // Given a duplicate mapping and the labels available in the current importer and locale
        const columns = [CONST.CSV_IMPORT_COLUMNS.EMAIL, value, value];
        const columnRoles = [{value, text}];

        // When validation resolves the duplicate
        const duplicate = findDuplicateColumnLabel(columns, columnRoles);

        // Then it uses the display label without translating or exposing the internal key
        expect(duplicate).toBe(text);
        expect(duplicate).not.toBe(value);
    });

    it.each([{columns: []}, {columns: [CONST.CSV_IMPORT_COLUMNS.EMAIL]}, {columns: [CONST.CSV_IMPORT_COLUMNS.IGNORE, CONST.CSV_IMPORT_COLUMNS.IGNORE]}])(
        'returns null for mappings without duplicates: $columns',
        ({columns}) => {
            // Given unique mappings or multiple ignored columns, which are allowed
            const columnRoles = [{value: CONST.CSV_IMPORT_COLUMNS.IGNORE, text: 'Ignore'}];

            // When validation checks for a duplicate
            const duplicate = findDuplicateColumnLabel(columns, columnRoles);

            // Then it does not report ignored or unique fields as errors
            expect(duplicate).toBeNull();
        },
    );

    it('keeps unknown duplicate roles invalid', () => {
        // Given a duplicate role that is no longer selectable in the current importer
        const columns = [CONST.CSV_IMPORT_COLUMNS.APPROVE_TO, CONST.CSV_IMPORT_COLUMNS.APPROVE_TO];

        // When no display label can be found
        const duplicate = findDuplicateColumnLabel(columns, []);

        // Then validation can still block the duplicate instead of silently accepting it
        expect(duplicate).toBe(CONST.CSV_IMPORT_COLUMNS.APPROVE_TO);
    });

    it('reports the first duplicate while skipping ignored columns', () => {
        // Given several duplicates with ignored columns occurring first
        const columns = [
            CONST.CSV_IMPORT_COLUMNS.IGNORE,
            CONST.CSV_IMPORT_COLUMNS.IGNORE,
            CONST.CSV_IMPORT_COLUMNS.GL_CODE,
            CONST.CSV_IMPORT_COLUMNS.GL_CODE,
            CONST.CSV_IMPORT_COLUMNS.NAME,
            CONST.CSV_IMPORT_COLUMNS.NAME,
        ];
        const columnRoles = [{value: CONST.CSV_IMPORT_COLUMNS.GL_CODE, text: 'GL code'}];

        // When validation checks the mappings in their original order
        const duplicate = findDuplicateColumnLabel(columns, columnRoles);

        // Then the first actual duplicate wins, just as in findDuplicate
        expect(duplicate).toBe('GL code');
    });
});
