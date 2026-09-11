import {findColumnName} from '@components/ImportColumn';

import CONST from '@src/CONST';

describe('findColumnName', () => {
    it('maps an "Updated vendor" header to the VENDOR role', () => {
        expect(findColumnName('Updated vendor')).toBe(CONST.CSV_IMPORT_COLUMNS.VENDOR);
    });

    it('maps an "Updated supplier" header to the VENDOR role, so a Xero-built template still auto-maps', () => {
        expect(findColumnName('Updated supplier')).toBe(CONST.CSV_IMPORT_COLUMNS.VENDOR);
    });
});
