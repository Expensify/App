import ONYXKEYS from '@src/ONYXKEYS';
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import Onyx from 'react-native-onyx';

/** Saves the layout once a drag ends, since mid-drag widths only live in CSS. */
function setTableColumnWidths(columnResizingID: string, storedTableColumnWidths: StoredTableColumnWidths) {
    // Clearing first makes Onyx replace the layout rather than deep merge it, so columns missing from it don't linger.
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: null});
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: storedTableColumnWidths});
}

/** Drops the saved layout, so the columns are sized from their content again. */
function clearTableColumnWidths(columnResizingID: string) {
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: null});
}

export {clearTableColumnWidths, setTableColumnWidths};
