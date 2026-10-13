import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import {tableColumnWidthsSelector} from '@src/selectors/TableColumnWidths';
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

/** Widths the user dragged, and the layout the last drag left, in tables sharing this `columnResizingID`. */
function useStoredColumnWidths(columnResizingID: string): StoredTableColumnWidths | undefined {
    const [storedColumnWidths] = useOnyx(ONYXKEYS.TABLE_COLUMN_WIDTHS, {selector: tableColumnWidthsSelector(columnResizingID)});
    return storedColumnWidths;
}

export default useStoredColumnWidths;
