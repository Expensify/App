import ONYXKEYS from '@src/ONYXKEYS';
import type {ColumnLayout} from '@src/types/onyx/TableColumnWidths';

import Onyx from 'react-native-onyx';

/** Persists a dragged column's width once the drag ends, with the layout the drag left painted. The drag itself only touches CSS. */
function setTableColumnWidth(columnResizingID: string, columnKey: string, width: number, columnLayout: ColumnLayout) {
    // Clearing first makes Onyx replace the layout rather than deep merge it, so columns missing from it don't linger.
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: {columnLayout: null}});
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: {columnWidthOverrides: {[columnKey]: width}, columnLayout}});
}

// eslint-disable-next-line import/prefer-default-export -- additional actions may be added here
export {setTableColumnWidth};
