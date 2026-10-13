import {setTableColumnWidth} from '@libs/actions/TableColumnWidths';

import ONYXKEYS from '@src/ONYXKEYS';
import type TableColumnWidths from '@src/types/onyx/TableColumnWidths';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TABLE_ID = 'workspaceTaxes';

function getTableColumnWidths(): Promise<TableColumnWidths | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.TABLE_COLUMN_WIDTHS,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('setTableColumnWidth', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps every dragged width but replaces the stored layout', async () => {
        // Given a drag stored while the table had a Tax code column
        setTableColumnWidth(TABLE_ID, 'taxCode', 460, {
            tableWidth: 1268,
            fitColumnWidths: {name: 80, taxRate: 67, taxCode: 182},
            columnWidths: {name: 356, taxRate: 360, taxCode: 460},
        });
        await waitForBatchedUpdates();

        // When a later drag is stored after the Tax code column was hidden
        setTableColumnWidth(TABLE_ID, 'name', 400, {
            tableWidth: 1268,
            fitColumnWidths: {name: 80, taxRate: 67},
            columnWidths: {name: 400, taxRate: 790},
        });
        await waitForBatchedUpdates();

        // Then both dragged widths are kept, while the layout holds only the latest drag's columns, so a stale column
        // from the earlier one can't make it look laid out for columns the table no longer has
        const tableColumnWidths = await getTableColumnWidths();

        expect(tableColumnWidths?.[TABLE_ID]?.columnWidthOverrides).toEqual({taxCode: 460, name: 400});
        expect(tableColumnWidths?.[TABLE_ID]?.columnLayout).toEqual({
            tableWidth: 1268,
            fitColumnWidths: {name: 80, taxRate: 67},
            columnWidths: {name: 400, taxRate: 790},
        });
    });
});
