import ONYXKEYS from '@src/ONYXKEYS';
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import Onyx from 'react-native-onyx';

/** Saves the layout once a column settles, since mid-drag widths only live in CSS. `null` drops it, so the columns size from their content again. */
function setTableColumnWidths(columnResizingID: string, storedTableColumnWidths: StoredTableColumnWidths | null) {
    // Clearing first makes Onyx replace the layout rather than deep merge it, so columns missing from it don't linger.
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: null});

    if (!storedTableColumnWidths) {
        return;
    }

    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: storedTableColumnWidths});
}

// eslint-disable-next-line import/prefer-default-export -- additional actions may be added here
export {setTableColumnWidths};
