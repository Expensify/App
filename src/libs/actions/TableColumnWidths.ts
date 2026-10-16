import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Persists a dragged column's width once the drag ends. The drag itself only touches CSS. */
function setTableColumnWidth(columnResizingID: string, columnKey: string, width: number) {
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: {[columnKey]: width}});
}

/** Drops a table's stored widths, so every column goes back to its content-sized default. */
function resetTableColumnWidths(columnResizingID: string) {
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: null});
}

export {setTableColumnWidth, resetTableColumnWidths};
