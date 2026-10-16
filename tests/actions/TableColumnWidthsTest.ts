import {resetTableColumnWidths, setTableColumnWidth} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TableColumnWidths} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

describe('table column width actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('drops every stored width of the reset table and keeps the other tables', async () => {
        // Given two dragged columns in the members table and one in the taxes table
        setTableColumnWidth(CONST.TABLES.COLUMN_RESIZING_IDS.WORKSPACE_MEMBERS, 'name', 260);
        setTableColumnWidth(CONST.TABLES.COLUMN_RESIZING_IDS.WORKSPACE_MEMBERS, 'email', 320);
        setTableColumnWidth(CONST.TABLES.COLUMN_RESIZING_IDS.WORKSPACE_TAXES, 'name', 180);
        await waitForBatchedUpdates();

        // When the members table's columns are reset
        resetTableColumnWidths(CONST.TABLES.COLUMN_RESIZING_IDS.WORKSPACE_MEMBERS);
        await waitForBatchedUpdates();

        // Then the members table falls back to content-sized widths, while the taxes table keeps its dragged width
        expect(await getTableColumnWidths()).toEqual({[CONST.TABLES.COLUMN_RESIZING_IDS.WORKSPACE_TAXES]: {name: 180}});
    });
});
