import {findColumnName} from '@components/ImportColumn';

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
});
