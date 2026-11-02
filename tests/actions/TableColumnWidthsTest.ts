import {setTableColumnWidths} from '@libs/actions/TableColumnWidths';

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

describe('TableColumnWidths actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('replaces the stored layout rather than merging into it', async () => {
        // Given a layout stored while the table had a Tax code column
        setTableColumnWidths(TABLE_ID, {
            availableColumnsWidth: 1176,
            columnWidths: {name: 356, taxRate: 360, taxCode: 460},
            resizedColumnKeys: ['taxCode'],
        });
        await waitForBatchedUpdates();

        // When a later drag is stored after the Tax code column was hidden
        setTableColumnWidths(TABLE_ID, {
            availableColumnsWidth: 1176,
            columnWidths: {name: 400, taxRate: 776},
            resizedColumnKeys: ['taxCode', 'name'],
        });
        await waitForBatchedUpdates();

        // Then only the latest drag's columns remain, or the old Tax code width would shrink the visible columns on reload
        const tableColumnWidths = await getTableColumnWidths();

        expect(tableColumnWidths?.[TABLE_ID]).toEqual({
            availableColumnsWidth: 1176,
            columnWidths: {name: 400, taxRate: 776},
            resizedColumnKeys: ['taxCode', 'name'],
        });
    });

    it('clears one table layout and leaves the others', async () => {
        // Given layouts stored for two tables
        const layout = {availableColumnsWidth: 1176, columnWidths: {name: 400, taxRate: 776}, resizedColumnKeys: ['name']};
        setTableColumnWidths(TABLE_ID, layout);
        setTableColumnWidths('workspaceCategories', layout);
        await waitForBatchedUpdates();

        // When the last dragged column of one table is reset
        setTableColumnWidths(TABLE_ID, null);
        await waitForBatchedUpdates();

        // Then only that table loses its layout, so it is sized from its content again while the other keeps its widths
        const tableColumnWidths = await getTableColumnWidths();

        expect(tableColumnWidths?.[TABLE_ID]).toBeUndefined();
        expect(tableColumnWidths?.workspaceCategories).toEqual(layout);
    });
});
